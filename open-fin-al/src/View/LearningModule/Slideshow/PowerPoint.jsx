// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { init as initPptxPreview } from "pptx-preview";

function PowerPoint(props) {
    const navigate = useNavigate();
    const [isDisabled, setIsDisabled] = useState(false);

    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);

    const pptxPath = props.pptxPath;

    window.console.log(pptxPath);
     
    //navigate to the learn base page
    const navigateToLearn = () => {
        navigate("/learn");
    };

    // -----------------------------
    // Initialize pptx-preview
    // -----------------------------
    useEffect(() => {
        if (!containerRef.current) return;
        if (!viewerRef.current) {
            viewerRef.current = initPptxPreview(containerRef.current, {
                width: 900,
                height: 506,
            });
        }
    }, []);

    useEffect(() => {
        if (!viewerRef.current || !pptxPath) return;

        const loadPptx = async () => {
            setIsDisabled(true);
            setCurrentSlide(0);

            let arrayBuffer;

            try {
                if (pptxPath.startsWith("https://")) {
                    const res = await fetch(pptxPath);
                    arrayBuffer = await res.arrayBuffer();                    
                } else {
                    arrayBuffer = await window.file.readBinary(pptxPath);
                }   
                
                await viewerRef.current.preview(arrayBuffer);

                if (containerRef.current) {
                    const slides = containerRef.current.querySelectorAll(
                        ".pptx-preview-slide-wrapper"
                    );
                    setTotalSlides(slides.length);
                    showSlide(0);
                }
            } catch (err) {
                window.console.error("Error loading PPTX file:", err);
            }

            setIsDisabled(false);
        };

        loadPptx();
    }, [pptxPath]);

    const showSlide = (index) => {
        if (!containerRef.current) return;

        const slides = containerRef.current.querySelectorAll(
        ".pptx-preview-slide-wrapper"
        );

        if (!slides.length) return;

        slides.forEach((el, i) => {
            el.style.display = i === index ? "block" : "none";
        });
    };

    useEffect(() => {
        if (totalSlides === 0) return;
        showSlide(currentSlide);
    }, [currentSlide, totalSlides]);


    const goPrev = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    const goNext = () => {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    };

    return (
        <div className="container">
            {/* Fixed-Size Slide Window */}
            <div className="slideshowWindow">
                {/* pptx-preview will render into this div */}
                <div
                    ref={containerRef}
                    style={{
                        width: "900px",
                        height: "506px",
                        border: "1px solid #ccc",
                        overflow: "hidden",
                        backgroundColor: "#000", // optional
                    }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent:"space-between" }}>
                    <button onClick={navigateToLearn} disabled={isDisabled}>
                        Back to Learn
                    </button>
                    <span>
                        Slide {totalSlides ? currentSlide + 1 : 0} / {totalSlides}
                    </span>
                    <div  style={{ display: "flex", gap:"10px" }}>
                        <button onClick={goPrev} disabled={isDisabled || currentSlide === 0}>
                            Previous
                        </button>
                        <button
                        onClick={goNext}
                        disabled={
                            isDisabled || totalSlides === 0 || currentSlide === totalSlides - 1
                        }
                        >
                        Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { PowerPoint };
