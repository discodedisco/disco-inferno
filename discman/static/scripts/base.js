const date = new Date();
document.querySelector('.year').innerHTML = date.getFullYear();

setTimeout(function () {
    document.querySelectorAll('.alert').forEach(function (alert) {
        alert.style.transition = 'opacity 0.5s';
        alert.style.opacity = '0';
        setTimeout(function () {
            alert.style.display = 'none';
        }, 500);
    });
}, 5000);

// document.addEventListener('click', function (e) {
//     if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
//         // Method 1: Focus/Blur
//         if (document.activeElement instanceof HTMLInputElement) {
//             document.activeElement.blur();
//         }

//         // Method 2: Viewport Manipulation
//         setTimeout(() => {
//             const viewportMeta = document.querySelector('meta[name="viewport"]');
//             if (viewportMeta && window.innerWidth < 768) {
//                 const originalContent = viewportMeta.getAttribute('content');
//                 viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
//                 setTimeout(() => {
//                     viewportMeta.setAttribute('content', originalContent || 'width=device-width, initial-scale=1.0');
//                 }, 200);
//             }
//         }, 300);
//     }
// });