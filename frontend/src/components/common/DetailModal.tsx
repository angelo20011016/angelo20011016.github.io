"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  image?: string;
  description?: string;
  content?: string; // For rich HTML content
  links?: { label: string; url: string }[];
  tags?: string[];
  date?: string; // For blog posts
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, title, image, description, content, links, tags, date }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null); // Ref for the inner modal content div

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling of body
      document.documentElement.style.overflow = 'hidden'; // Prevent scrolling of html element
      gsap.to(modalRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(modalRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.out', onComplete: () => {
        document.body.style.overflow = 'visible'; // Restore body scrolling
        document.documentElement.style.overflow = 'visible'; // Restore html scrolling
      }});
    }
    // Cleanup function to ensure scroll is restored if component unmounts while modal is open
    return () => {
      document.body.style.overflow = 'visible';
      document.documentElement.style.overflow = 'visible';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ visibility: 'hidden' }} // Start hidden for GSAP autoAlpha
      onClick={onClose} // Click outside to close
    >
      <div
        ref={modalContentRef}
        className="relative bg-zinc-900 rounded-lg shadow-2xl w-full max-w-4xl h-full md:h-5/6 flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        {/* Close Button - Fixed to the top right of the modal container */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400 text-3xl z-10 transition-colors duration-300 p-2 rounded-full bg-zinc-800 bg-opacity-50 hover:bg-opacity-75"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar pt-12"> {/* Added pt-12 for spacing below the fixed button */}
            {/* Header/Image */}
            {image && (
            <div className="relative w-full h-64 md:h-80 bg-cover bg-center rounded-t-lg overflow-hidden flex-shrink-0">
                <Image src={image} alt={title} fill style={{objectFit:"cover"}} quality={90} />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-10 flex-grow text-left">
            <h2 className="font-mono text-4xl md:text-5xl font-bold mb-4 uppercase leading-tight">{title}</h2>
            
            {date && <p className="font-inter text-gray-400 text-sm mb-4">{date}</p>}

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                    <span key={index} className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-sm font-inter">
                    {tag}
                    </span>
                ))}
                </div>
            )}

            {description && <p className="font-inter text-lg text-gray-300 mb-6">{description}</p>}

            {/* Rich HTML Content */}
            {content && (
                <div
                className="font-inter text-gray-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
                />
            )}

            {links && links.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-8">
                {links.map((link, index) => (
                    <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 border-2 border-white text-white font-bold uppercase tracking-wider text-sm rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                    >
                    {link.label}
                    </a>
                ))}
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
