import { Variants } from "framer-motion"

// Fade in from bottom
export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Fade in with scale
export const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Slide in from left
export const slideInLeft: Variants = {
    hidden: {
        opacity: 0,
        x: -50,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Slide in from right
export const slideInRight: Variants = {
    hidden: {
        opacity: 0,
        x: 50,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Stagger container
export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
}

// Stagger container with faster timing
export const staggerContainerFast: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
}

// Fade in simple
export const fadeIn: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
}

// Blur in
export const blurIn: Variants = {
    hidden: {
        opacity: 0,
        filter: "blur(10px)",
    },
    visible: {
        opacity: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Card hover effect
export const cardHover: Variants = {
    rest: {
        y: 0,
        transform: "none",
    },
    hover: {
        y: -8,
        boxShadow: "0 20px 40px rgba(212, 175, 55, 0.2)",
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Button hover effect
export const buttonHover: Variants = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    tap: {
        scale: 0.98,
    },
}

// Text reveal character by character
export const textReveal: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.02,
        },
    },
}

export const charReveal: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Page transition
export const pageTransition: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: "easeIn",
        },
    },
}

// Floating animation
export const floatingAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
}

// Glow pulse animation
export const glowPulse = {
    animate: {
        boxShadow: [
            "0 0 20px rgba(212, 175, 55, 0.3)",
            "0 0 40px rgba(212, 175, 55, 0.5)",
            "0 0 20px rgba(212, 175, 55, 0.3)",
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
}

// Counter animation helper
export const counterAnimation = (value: number) => ({
    initial: { opacity: 0, scale: 0.5 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
})

// Scroll progress variants
export const scrollProgress: Variants = {
    hidden: { scaleX: 0 },
    visible: (progress: number) => ({
        scaleX: progress,
        transition: {
            duration: 0.1,
        },
    }),
}
