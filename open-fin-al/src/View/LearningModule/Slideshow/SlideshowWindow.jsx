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

            {/* Navigation Buttons Outside the Window */}
            <button 
                className={`nav-button left ${props.currentPageIndex === 0 ? "disabled" : ""}`} 
                onClick={() => handleNavigation(previousPageIndex)}
                disabled={props.currentPageIndex === 0}
            >
                Previous
            </button>

            {/* Fixed-Size Slide Window */}
            <div className="slideshowWindow">
                <Slide page={currentPage} registerSlide={handleSlide} />
                {currentPage.voiceoverUrl && (
                    <button className="audio-button" onClick={playAudio} disabled={isDisabled}>
                        Play Audio
                    </button>
                )}
            </div>

            <button 
                className={`nav-button right ${nextPageIndex >= props.pages.length ? "disabled" : ""}`} 
                onClick={() => handleNavigation(nextPageIndex)}
                disabled={nextPageIndex >= props.pages.length}
            >
                Next
            </button>

            {/* Styling */}
            <style jsx>{`
                .container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    gap: 40px; /* Adjusted spacing for better alignment */
                    flex-direction: row; /* Aligns buttons to the left & right of the slide */
                    position: relative;
                }
                .slideshowWindow {
                    width: 600px; /* Fixed width */
                    height: 500px; /* Fixed height */
                    border: 5px solid var(--row-alternating-color);
                    border-radius: 10px;
                    text-align: center;
                    background: var(--row-primary-color);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .nav-button {
                    background: #00aeda;
                    color: white;
                    padding: 15px 25px;
                    border: none;
                    cursor: pointer;
                    border-radius: 5px;
                    font-size: 16px;
                }
                .nav-button.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .audio-button {
                    background: #00aeda;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    cursor: pointer;
                    margin-top: 20px;
                    border-radius: 5px;
                }
                .audio-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                    .nav-button.learn {
                    background: #00aeda;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
            `}</style>
        </div>
    );
}

export { SlideshowWindow };
