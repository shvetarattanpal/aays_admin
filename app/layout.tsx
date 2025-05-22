
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Cloudinary Upload Widget Script */}
        <script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          type="text/javascript"
          async
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}


/*
"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Cloudinary Upload Widget Script }
          <script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            type="text/javascript"
            async
          ></script>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
*/

/*
"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      {/* Load Cloudinary script correctly }
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        strategy="lazyOnload"
      />
      {children}
    </ClerkProvider>
  );
}
*/

/*
"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="lazyOnload"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
*/