import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">Leather Craft Shop</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>Beranda</Nav.Link>
            <NavDropdown title="Kategori" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/category/pria">Pria</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/category/wanita">Wanita</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={NavLink} to="/login">Admin</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;