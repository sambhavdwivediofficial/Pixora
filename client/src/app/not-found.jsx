"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/not-found.css";

export default function NotFound() {
  useEffect(() => {
    // Set page title
    document.title = "404 - Page Not Found | Pixora";
    
    // Prevent scrolling
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    
    // Cleanup when component unmounts
    return () => {
      document.title = ""; // Reset title if needed
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      <Navbar />

      <main className="container">
        <div className="glow"></div>

        <span className="code">404</span>

        <h1 className="title">
          Lost In The Void
        </h1>

        <p className="description">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link href="/" className="button">
          Return Home
        </Link>
      </main>

      <Footer />
    </div>
  );
}