import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/header.css';
import logo from '../assets/logo.webp';
import { Row } from "react-bootstrap";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Crack-ED Logo" />
        </Link>
        <div className="logo-title">Vertical of <span style={{color:'#EE5A32'}}>CarDekho Group </span></div>
      </div>
      <nav className="nav">
        <ul className="nav-list">
          <LinkItem link="/" title="Home" />
          <LinkItem link="/about" title="About" />
          <LinkItem link="#" title="Job Linked Programs" dropdown={true}>
            <li><Link to="/aurum-bankers-program">Aurum Bankers Program</Link></li>
            <li><Link to="/gfgc-credit-associate-program">GFGC Credit Underwriting</Link></li>
            <li><Link to="/gfgc-legal-underwriting-program">GFGC Legal Underwriting</Link></li>
            <li><Link to="/gfgc-tech-associate-program">GFGC Tech Associate</Link></li>
            <li><Link to="/lenskart-eyetech-program">Lenskart Eyetech Program</Link></li>
            <li><Link to="/sk-finance-management-trainee-program">SK Finance Management Trainee Program</Link></li>
            <li><Link to="/insurops-program">InsurOps Program</Link></li>
            <li><Link to="/hdfc-teller-program">HDFC Teller Program</Link></li>
          </LinkItem>
          <LinkItem link="/programs" title="Other Programs" dropdown={true}>
            <li><Link to="/corporate-programs">Corporate Programs</Link></li>
            <li><Link to="/college-programs">College Programs</Link></li>
          </LinkItem>
          <LinkItem link="/resources" title="Resources" dropdown={true}>
            <li><Link to="/resources/blogs">Blogs</Link></li>
            <li><Link to="/resources/events">Events</Link></li>
            <li><Link to="/resources/media-coverage-v2">Media Coverage</Link></li>
            <li><Link to="/resources/gallery">Gallery</Link></li>
          </LinkItem>
          <LinkItem link="/podcast-page" title="Podcast" />
          <LinkItem link="/contact-us" title="Contact Us" />
        </ul>
      </nav>
    </header>
  );


};

const LinkItem = ({ title, link, dropdown, children }) => {
  return (
    <li className={dropdown ? "nav-item dropdown" : "nav-item"}>
      <div className="nav-link-row">
      <Link to={link} className="nav-link">{title}</Link>
      {dropdown ? (
             <span class="sub-arrow"><svg class="e-font-icon-svg e-fas-angle-down" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"></path></svg></span>
      ):null}
      </div>
      <div className="header-underline" />
      {dropdown && (
        <ul className="dropdown-menu">
          {children}
        </ul>
      )}
    </li>
  );
};
export default Header;
