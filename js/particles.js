function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Randomly choose particle color
    const colors = ['white', 'purple', 'green'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.classList.add(color);
    
    // Random size between 2 and 6 pixels
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random starting position
    const startX = Math.random() * window.innerWidth;
    particle.style.left = `${startX}px`;
    particle.style.bottom = '-20px';
    
    // Add to container
    document.querySelector('.particles').appendChild(particle);
    
    // Remove particle after animation completes
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

// Create particles at regular intervals
function startParticles() {
    setInterval(createParticle, 200);
}

// Start generating particles when the page loads
window.addEventListener('load', startParticles); 