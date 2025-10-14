const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const archiver = require('archiver');

// In-memory job tracker for import progress
const dbJobs = new Map();

function newJob() {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    status: 'pending', // pending | running | completed | error
    stage: 'init', // init | parsing | importing | done | error
    startedAt: Date.now(),
    finishedAt: null,
    totalCollections: 0,
    processedCollections: 0,
    totals: {}, // { [collection]: { totalDocs, processedDocs } }
    error: null,
  };
  dbJobs.set(id, job);
  return job;
}

exports.getInfo = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const cols = await db.listCollections().toArray();
    const collections = [];
    for (const c of cols) {
      try {
        const count = await db.collection(c.name).countDocuments();
        collections.push({ name: c.name, count });
      } catch (_) {
        collections.push({ name: c.name, count: null });
      }
    }
    res.status(200).json({ success: true, data: { dbName, collections } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil info database', error: err.message });
  }
};

exports.exportDatabase = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const cols = await db.listCollections().toArray();
    const selected = Array.isArray(req.body?.collections) && req.body.collections.length ?
      req.body.collections.map(String) : cols.map(c => c.name);

    const payload = {
      database: dbName,
      exportedAt: new Date().toISOString(),
      collections: {}
    };

    for (const name of selected) {
      const arr = await db.collection(name).find({}).toArray();
      // Do not expose password in plain form; keep hashed field as-is
      payload.collections[name] = arr;
    }

    const filename = `mongo-export-${dbName}-${new Date().toISOString().slice(0,10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(payload));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor database', error: err.message });
  }
};

// Export database JSON + semua file di folder uploads sebagai ZIP
exports.exportDatabaseZip = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const cols = await db.listCollections().toArray();
    const selected = Array.isArray(req.body?.collections) && req.body.collections.length
      ? req.body.collections.map(String)
      : cols.map(c => c.name);

    const payload = {
      database: dbName,
      exportedAt: new Date().toISOString(),
      collections: {},
      meta: {
        includes: { dataJson: true, uploadsDir: true },
      },
    };

    for (const name of selected) {
      const arr = await db.collection(name).find({}).toArray();
      payload.collections[name] = arr;
    }

    const filename = `mongo-export-${dbName}-${new Date().toISOString().slice(0,10)}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      // Jangan kirim dua kali; jika sudah mulai streaming, gunakan res.end
      try {
        res.status(500).json({ success: false, message: 'Gagal membuat ZIP', error: err.message });
      } catch (_) {}
    });

    archive.pipe(res);

    // Tambahkan data.json
    archive.append(JSON.stringify(payload, null, 2), { name: 'data.json' });

    // Sertakan folder uploads (jika ada)
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads');
    }

    await archive.finalize();
  } catch (err) {
    console.error('exportDatabaseZip error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor ZIP', error: err.message });
  }
};

exports.importDatabase = async (req, res) => {
  // File uploaded via multer as req.file
  const file = req.file;
  const replaceExisting = String(req.body?.replaceExisting || 'true').toLowerCase() === 'true';
  const job = newJob();
  job.status = 'running';
  job.stage = 'parsing';
  try {
    if (!file || !file.path) {
      job.status = 'error';
      job.stage = 'error';
      job.error = 'Tidak ada file yang diunggah';
      return res.status(400).json({ success: false, message: job.error, jobId: job.id });
    }
    const raw = await fs.promises.readFile(file.path, 'utf8');
    const json = JSON.parse(raw);
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const collections = json.collections || {};
    const names = Object.keys(collections);
    job.totalCollections = names.length;
    job.stage = 'importing';
    job.totals = {};
    for (const n of names) {
      const docs = Array.isArray(collections[n]) ? collections[n] : [];
      job.totals[n] = { totalDocs: docs.length, processedDocs: 0 };
      const coll = db.collection(n);
      if (replaceExisting) {
        try { await coll.deleteMany({}); } catch (_) {}
      }
      if (docs.length > 0) {
        // Insert in batches to avoid memory spikes
        const batchSize = 1000;
        for (let i = 0; i < docs.length; i += batchSize) {
          const slice = docs.slice(i, i + batchSize);
          await coll.insertMany(slice, { ordered: false });
          job.totals[n].processedDocs = Math.min(docs.length, i + slice.length);
        }
      }
      job.processedCollections += 1;
    }
    job.status = 'completed';
    job.stage = 'done';
    job.finishedAt = Date.now();
    try { fs.unlinkSync(file.path); } catch (_) {}
    res.status(200).json({ success: true, message: 'Import dimulai', jobId: job.id, dbName });
  } catch (err) {
    job.status = 'error';
    job.stage = 'error';
    job.error = err.message;
    job.finishedAt = Date.now();
    res.status(500).json({ success: false, message: 'Gagal mengimpor database', error: err.message, jobId: job.id });
  }
};

exports.getProgress = async (req, res) => {
  const { jobId } = req.params;
  const job = dbJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job tidak ditemukan' });
  }
  res.status(200).json({ success: true, data: job });
};