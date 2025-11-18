// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slide } from "./Slide";
import { Howl } from "howler";

function SlideshowWindow(props) {
    const nextPageIndex = props.currentPageIndex + 1;
    const previousPageIndex = props.currentPageIndex - 1;
    const navigate = useNavigate();
    const [slide, setSlide] = useState({ soundRef: null, slideState: null });
    const [isDisabled, setIsDisabled] = useState(false);
    const soundRef = useRef(null);

    // Registers slide audio from Slide component
    const handleSlide = (sound, handleButtonReset) => {
        setSlide({ soundRef: sound, slideState: handleButtonReset || null });
    };

    const unloadAudio = () => {
        if (slide.soundRef) {
            slide.soundRef.unload();
            slide.slideState && slide.slideState();
            setIsDisabled(false);
        }

        if (soundRef.current) {
            soundRef.current.unload();
            setIsDisabled(false);
        }
    };

    //navigate to the next or previous slide
    const handleNavigation = (index) => {
        unloadAudio();
        navigate("/learningModulePage", {
            state: {
                pages: props.pages,
                currentPageIndex: index,
            }
        });
    };
     
    //navigate to the learn base page
    const navigateToLearn = () => {
        navigate("/learn");
    };
    
    const handleComplete = async () => {
        try {
            // For now, same as start_module: userId = 1
            const userId = 1;

            const currentPage = props.pages[props.currentPageIndex];
            const moduleId =
                currentPage?.moduleId ?? props.pages[0]?.moduleId;

            if (!moduleId) {
                console.error("No moduleId found on pages:", props.pages);
                alert("Could not determine module id for completion.");
                return;
            }

            const score = 1.0; // 100% – passes the 0.70 threshold in mark_completed

            const resp = await window.api.post("/api/module/complete", {
                userId,
                moduleId,
                score,
            });

            console.log("POST /api/module/complete ->", resp.status, resp.text);
            alert("Module marked as completed!");
        } catch (err) {
            console.error("complete_module error", err);
            alert("Could not mark module as completed. Check console for details.");
        }
    };



    const playAudio = () => {
        const currentPage = props.pages[props.currentPageIndex];
        console.log("Current Page:", currentPage); // Log the current page
        if (currentPage.voiceoverUrl) {
            var audioSrc = `Asset/LearningModulesVoiceovers/${currentPage.voiceoverUrl}`;
            console.log("Audio Source:", audioSrc); // Log the audio source
            
            soundRef.current = new Howl({
                src: [audioSrc],
                onend: () => setIsDisabled(false),
            });

            setIsDisabled(true);
            soundRef.current.play();
        } else {
            console.log("No voiceover URL for this slide."); // Log if there is no voiceover URL
        }
    };

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unload();
            }
        };
    }, []);

    const currentPage = props.pages[props.currentPageIndex];

    return (
        <div className="container">

            {/*Button to navigate to the learn page */}
            <button 
                className="nav-button learn"
                onClick={navigateToLearn}
            >
                Go to Learn
            </button>
            <button 
                className="nav-button complete"
                onClick={handleComplete}
            >
                Complete Module
            </button>

            {/* Navigation Buttons Outside the Window
            <button 
                className={`nav-button left ${props.currentPageIndex === 0 ? "disabled" : ""}`} 
                onClick={() => handleNavigation(previousPageIndex)}
                disabled={props.currentPageIndex === 0}
            >
                Previous
            </button> */}

            {/* Fixed-Size Slide Window */}
            <div className="slideshowWindow">
                <Slide page={currentPage} registerSlide={handleSlide} />
                {currentPage.voiceoverUrl && (
                    <button className="audio-button" onClick={playAudio} disabled={isDisabled}>
                        Play Audio
                    </button>
                )}
            </div>

            {/* <button 
                className={`nav-button right ${nextPageIndex >= props.pages.length ? "disabled" : ""}`} 
                onClick={() => handleNavigation(nextPageIndex)}
                disabled={nextPageIndex >= props.pages.length}
            >
                Next
            </button> */}

            {/* Styling */}
            <style jsx>{`
                .container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    /* CHANGE: Use 100% height to fit parent, assuming html/body is set to 100vh or 100% */
                    height: 100%; 
                    width: 100%; /* Ensure full width */
                    gap: 24px;
                    flex-direction: row;
                    position: relative;
                    background: var(--app-background, #222);
                    padding: 20px;
                    /* ADD: Overflow hidden to prevent the container itself from being scrollable */
                    overflow: hidden; 
                }

                /* Main viewer window */
                .slideshowWindow {
                    /* CHANGE: Use 100% of parent's space */
                    width: 90vw;
                    height: 90vh;
                    max-width: 90vw;
                    max-height: 90vh;
                    border: 4px solid var(--row-alternating-color);
                    border-radius: 12px;
                    background: var(--row-primary-color, #111);
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: flex-start;
                    padding: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                    overflow: hidden;
                    position: relative;
                }

                /* Toolbar area (inside the slideshow window) */
                .slideshowWindow .toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 8px 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02));
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: var(--text-color, #fff);
                    font-weight: 600;
                }

                .slideshowWindow .toolbar .title {
                    font-size: 18px;
                }

                .slideshowWindow .toolbar .controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .toolbar button {
                    background: rgba(0,174,218,0.95);
                    color: white;
                    padding: 6px 10px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .toolbar input[type="number"] {
                    width: 64px;
                    padding: 6px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(0,0,0,0.15);
                    color: var(--text-color, #fff);
                }

                /* Content area that holds the pdf/embed/iframe */
                .slideshowWindow .contentContainer {
                    flex: 1 1 auto;
                    /* CHANGE 2: Remove absolute 100vw/100vh from contentContainer */
                    width: 100%; /* Use 100% of the slideshowWindow's width */
                    height: 100%; /* Use 100% of the remaining height */
                    display: flex;
                    /* ADD: Center the content horizontally and vertically inside */
                    align-items: center; 
                    justify-content: center;
                    background: var(--viewer-bg, #0b0b0b);
                    overflow: hidden;
                    padding: 12px;
                }

                /* Ensure the parsed .slide element fills the slideshow window so
                   .contentContainer can size correctly. Also allow flex children to
                   shrink (min-height:0) so overflow works inside flex containers. */
                .slideshowWindow .slide {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .slideshowWindow .slide > .contentContainer {
                    flex: 1 1 auto;
                    min-height: 0; /* allow the contentContainer to scroll inside flex */
                }

                /* Ensure embeds and iframes scale nicely */
                .slideshowWindow .contentContainer iframe,
                .slideshowWindow .contentContainer embed,
                .slideshowWindow .contentContainer object {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                    border: 0;
                    display: block;
                    background: transparent;
                }

                /* Force child elements (including inline-embedded viewers) to fill the container.
                   Many imported HTML slides include fixed pixel sizes; these overrides make them responsive. */
                .slideshowWindow .contentContainer > *,
                .slideshowWindow .contentContainer * {
                    box-sizing: border-box !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* If the embedded viewer renders a small internal toolbar, increase its scale to match container. */
                .slideshowWindow .contentContainer embed object iframe::shadow,
                .slideshowWindow .contentContainer embed::shadow,
                .slideshowWindow .contentContainer object::shadow {
                    width: 100% !important;
                    height: 100% !important;
                }

                /* If rendering canvases inside the slide, center them */
                .slideshowWindow .contentContainer .pdfPageCanvas {
                    max-width: 100%;
                    max-height: 100%;
                    margin: 0 auto;
                    display: block;
                }

                /* Overlay navigation buttons (large, visible) */
                .nav-button {
                    background: rgba(0,174,218,0.95);
                    color: white;
                    width: 56px;
                    height: 56px;
                    padding: 0;
                    border: none;
                    cursor: pointer;
                    border-radius: 50%;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.5);
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                }

                .nav-button.left { left: 8px; }
                .nav-button.right { right: 8px; }

                .nav-button.disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    filter: grayscale(30%);
                }

                /* Larger click target for the audio button, placed in the toolbar area */
                .audio-button {
                    background: rgba(0,174,218,0.95);
                    color: white;
                    padding: 8px 14px;
                    border: none;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .audio-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .nav-button.learn {
                    background: rgba(0,174,218,0.95);
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    border-radius: 6px;
                    padding: 8px 12px;
                    z-index: 12;
                }

                .nav-button.complete {
                    background: #28a745;
                    position: absolute;
                    top: 12px;
                    left: 140px;   /* moves it to the right of Go to Learn button */
                    border-radius: 6px;
                    padding: 8px 12px;
                    z-index: 12;
                }

                /* Responsive adjustments */
                @media (max-width: 900px) {
                    .nav-button { width: 48px; height: 48px; }
                    .slideshowWindow { width: 98vw; height: 92vh; }
                    .slideshowWindow .toolbar .title { font-size: 16px; }
                }

            `}</style>
        </div>
    );
}

export { SlideshowWindow };
