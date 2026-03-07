import { useEffect, useRef } from 'react';

const NodeNetwork = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollPos = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Type definition for nodes
        type Node = {
            x: number;
            y: number;
            vx: number;
            vy: number;
        };

        let nodes: Node[] = [];

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Re-initialize nodes on major resize to prevent them grouping weirdly
            if (nodes.length === 0) {
                for (let i = 0; i < 60; i++) {
                    nodes.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vx: (Math.random() - 0.5) * 1,
                        vy: (Math.random() - 0.5) * 1
                    });
                }
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update based on scroll
            const currentScroll = window.scrollY;
            // Scroll speed modifier, with a max cap to prevent crazy speeds
            const scrollDiff = Math.abs(currentScroll - scrollPos.current);
            const speedMultiplier = 1 + Math.min(scrollDiff * 0.1, 5);

            scrollPos.current = currentScroll;

            nodes.forEach((node, i) => {
                // Move nodes
                node.x += node.vx * speedMultiplier;
                node.y += node.vy * speedMultiplier;

                // Bounce off walls smoothly
                if (node.x < 0) { node.x = 0; node.vx *= -1; }
                if (node.x > canvas.width) { node.x = canvas.width; node.vx *= -1; }
                if (node.y < 0) { node.y = 0; node.vy *= -1; }
                if (node.y > canvas.height) { node.y = canvas.height; node.vy *= -1; }

                // Draw connections (only if close)
                // Optimization: start loop from i + 1 to avoid double-drawing and self-drawing
                for (let j = i + 1; j < nodes.length; j++) {
                    const other = nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const distSq = dx * dx + dy * dy; // Use squared distance for performance
                    const maxDist = 150;

                    if (distSq < maxDist * maxDist) {
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        // Using a frosted blue / cotton candy pink tone based on your CSS variables
                        const alpha = 1 - dist / maxDist;
                        ctx.strokeStyle = `rgba(168, 218, 220, ${alpha * 0.6})`; // Frosted Blue from your index.css
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }

                // Optionally draw the node points themselves
                ctx.beginPath();
                ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230, 57, 70, 0.4)`; // Punch Red
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);

        // Add scroll event listener to trigger the speed burst even without RAF loop catching it immediately
        const handleScroll = () => {
            // This is intentionally light, just forces the next frame to pick up the new scrollY
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 bg-background pointer-events-none"
            aria-hidden="true"
        />
    );
};

export default NodeNetwork;
