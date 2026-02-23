'use client';

import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-6 h-6 text-primary" />
              <span className="font-bold text-foreground">MediCare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dedicated to providing quality healthcare services and excellent patient experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/doctors" className="hover:text-primary transition">
                  Browse Doctors
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <p className="text-sm text-muted-foreground space-y-2">
              <span className="block">📞 +1 (800) 123-4567</span>
              <span className="block">📧 info@medicare.com</span>
              <span className="block">📍 123 Medical Center Lane</span>
              <span className="block">Healthcare City, ST 12345</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; 2024 MediCare Hospital Management System. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition">
                Twitter
              </a>
              <a href="#" className="hover:text-primary transition">
                Facebook
              </a>
              <a href="#" className="hover:text-primary transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
