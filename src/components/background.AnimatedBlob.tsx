"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function AnimatedBlobs() {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Blob 1
      gsap.to(blob1Ref.current, {
        x: () => Math.random() * 200 - 100,
        y: () => Math.random() * 200 - 100,
        scale: 1.15,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Blob 2
      gsap.to(blob2Ref.current, {
        x: () => Math.random() * 150 - 75,
        y: () => Math.random() * 150 - 75,
        scale: 1.25,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });

      // Blob 3
      gsap.to(blob3Ref.current, {
        x: () => Math.random() * 180 - 90,
        y: () => Math.random() * 180 - 90,
        scale: 1.2,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      // Rotations
      gsap.to([blob1Ref.current, blob3Ref.current], {
        rotation: 360,
        duration: 25,
        repeat: -1,
        ease: "none",
      });

      gsap.to(blob2Ref.current, {
        rotation: -360,
        duration: 30,
        repeat: -1,
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Blob 1 */}
      <div
        ref={blob1Ref}
        className="absolute left-[-10%] top-[20%] h-[800px] w-[800px] opacity-60 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,0,136,0.4), rgba(255,0,136,0) 70%)",
        }}
      />

      {/* Blob 2 */}
      <div
        ref={blob2Ref}
        className="absolute left-[5%] top-[0%] h-[900px] w-[900px] opacity-50 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(21,0,255,0.4), rgba(21,0,255,0) 70%)",
        }}
      />

      {/* Blob 3 */}
      <div
        ref={blob3Ref}
        className="absolute right-0 top-[5%] h-[850px] w-[850px] opacity-55 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(214,178,64,0.4), rgba(214,178,64,0) 70%)",
        }}
      />
    </div>
  );
}
