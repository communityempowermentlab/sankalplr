import React from 'react';
import celLogo from '../assets/cel_logo.png';

const DashFooter = () => {
    return (
        <footer className="dash-footer">
            <div className="dash-footer-left">
                &copy; <span>{new Date().getFullYear()}</span>&nbsp;<em>Sankalp LR</em>&nbsp;— Labour Case Monitoring System. All rights reserved.
            </div>
            <div className="dash-footer-right">
                <a className="dash-footer-link" href="#">Privacy Policy</a>
                <div className="dash-footer-sep"></div>
                <a className="dash-footer-link" href="#">Terms of Use</a>
                <div className="dash-footer-sep"></div>
                <a className="dash-footer-link" href="#">Support</a>
                <div className="dash-footer-sep"></div>
                <span className="dash-ver-tag">v1.0.0</span>
            </div>
        </footer>
    );
};

export default DashFooter;
