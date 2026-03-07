"use client";

import { useEffect, useRef } from 'react';

const NodeNetwork = ({ isDark }: { isDark: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollPos = useRef(0);
    const isDarkRef = useRef(isDark);

    useEffect(() => {
        isDarkRef.current = isDark;
    }, [isDark]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        type Node = {
            x: number;
            y: number;
            vx: number;
            vy: number;
        };

        let nodes: Node[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            if (nodes.length === 0) {
                for (let i = 0; i < 40; i++) {
                    nodes.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: (Math.random() - 0.5) * 0.8
                    });
                }
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const currentScroll = window.scrollY;
            scrollPos.current = currentScroll;
            const speedMultiplier = 1;

            nodes.forEach((node, i) => {
                node.x += node.vx * speedMultiplier;
                node.y += node.vy * speedMultiplier;

                if (node.x < 0) { node.x = 0; node.vx *= -1; }
                if (node.x > canvas.width) { node.x = canvas.width; node.vx *= -1; }
                if (node.y < 0) { node.y = 0; node.vy *= -1; }
                if (node.y > canvas.height) { node.y = canvas.height; node.vy *= -1; }

                for (let j = i + 1; j < nodes.length; j++) {
                    const other = nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const distSq = dx * dx + dy * dy;
                    const maxDist = 220;

                    if (distSq < maxDist * maxDist) {
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();

                        const baseConnectionAlpha = isDarkRef.current ? 0.25 : 0.15;
                        const alpha = 1 - dist / maxDist;
                        ctx.globalAlpha = alpha * baseConnectionAlpha;
                        ctx.strokeStyle = isDarkRef.current ? '#ADB5BD' : '#1D3557';
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }

                const baseNodeAlpha = isDarkRef.current ? 0.35 : 0.25;
                ctx.globalAlpha = baseNodeAlpha;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = isDarkRef.current ? '#ADB5BD' : '#1D3557';
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
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
