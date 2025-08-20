const btn = document.getElementById('messages-draggable-btn');
const modal = document.getElementById('messages-modal');
const menuBtn = document.getElementById('messages-menu-btn');
const threadList = document.getElementById('messages-thread-list');
const threadBar = document.getElementById('messages-thread-bar');

let dragging = false, offsetX = 0, offsetY = 0, dragMoved = false;

// Disable transitions until DOMContentLoaded
btn.style.transition = 'none';
modal.style.transition = 'none';

// Restore pos from localStorage
function restoreBtnPosition() {
    const pos = JSON.parse(localStorage.getItem('messagesBtnPos'));
    if (pos) {
        btn.style.left = pos.left;
        btn.style.top = pos.top;
        modal.style.left = pos.left;
        modal.style.top = pos.top;
    }
}
restoreBtnPosition();

// enable transitions after DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        btn.style.transition = '';
        modal.style.transition = '';
    }, 0);
});

// Drag logic
btn.addEventListener('mousedown', e => {
    dragging = true;
    dragMoved = false
    offsetX = e.clientX - btn.offsetLeft;
    offsetY = e.clientY - btn.offsetTop;
    document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', e => {
    if (!dragging || modal.classList.contains('active')) return;
    dragMoved = true;
    let minLeft = getMinBtnLeft();
    let x = e.clientX - offsetX;
    if (x < minLeft) x = minLeft;
    let y = e.clientY - offsetY;
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    modal.style.left = x + 'px';
    modal.style.top = y + 'px';
    
    if (modal.classList.contains('active')) {
        const btnRect = btn.getBoundingClientRect();
        modal.style.visibility = 'hidden';
        modal.style.display = 'flex';
        const modalHeight = modal.offsetHeight;
        modal.style.display = '';
        modal.style.visibility = '';
        const top = btnRect.top + (btnRect.height / 2) - (modalHeight / 2);
        const left = btnRect.left + (btnRect.width / 2);
        modal.style.top = `${top}px`;
        modal.style.left = `${left}px`;
    } else {
        modal.style.left = x + 'px';
        modal.style.top = y + 'px';
    }
});
document.addEventListener('mouseup', e => {
    if (dragging) {
        localStorage.setItem('messagesBtnPos', JSON.stringify({
            left: btn.style.left,
            top: btn.style.top
        }));
    }
    dragging = false;
    document.body.style.userSelect = '';
});

let lastBtnPos = {
    left: btn.style.left,
    top: btn.style.top
};
const dockedPos = {
    left: `calc(20vw - ${btn.offsetWidth + 2}px)`,
    top: `calc(100vh - ${btn.offsetHeight + 32}px)`
};

function getMinBtnLeft() {
    if (modal.classList.contains('active')) {
        modal.style.visibility = 'hidden';
        modal.style.display = 'flex';
        const modalWidth = modal.offsetWidth;
        modal.style.display = '';
        modal.style.visibility = '';
        let safeModalLeft = btn.offsetLeft + (btn.offsetWidth / 2);
        if (safeModalLeft + modalWidth > window.innerWidth) {
            safeModalLeft = window.innerWidth - modalWidth - 16;
        }
        if (safeModalLeft < 0) {
            safeModalLeft = 16;
        }
        return safeModalLeft - (btn.offsetWidth / 2);
    } else {
        return 16;
    }
}

function moveBtnAndModal(left, top) {
    btn.style.transition = 'left 0.25s, top 0.25s';
    modal.style.transition = 'left 0.25s, top 0.25s';
    btn.style.left = left;
    btn.style.top = top;
    modal.style.left = left;
    modal.style.top = top;
    setTimeout(() => {
        btn.style.transition = '';
        modal.style.transition = '';
    }, 250);
}

function dockBtnAndModal() {
    const btnRect = btn.getBoundingClientRect();
    modal.style.visibility = 'hidden';
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        void modal.offsetWidth;
        const modalWidth = modal.offsetWidth;
        const modalHeight = modal.offsetHeight;
        modal.style.display = '';
        modal.style.visibility = '';
        const dockTop = window.innerHeight - btnRect.height - 32;
        const modalLeft = btnRect.left + (btnRect.width / 2);
        let safeModalLeft = modalLeft;
        if (safeModalLeft + modalWidth > window.innerWidth) {
            safeModalLeft = window.innerWidth - modalWidth - 16;
        }
        if (safeModalLeft < 0) {
            safeModalLeft = 16;
        }
        let btnLeft = (safeModalLeft - (btnRect.width / 2), 16);
        if (btnLeft < 0) {
            btnLeft = 16;
        }
        if (btnLeft + btnRect.width > window.innerWidth) btnLeft = window.innerWidth = btnRect.width - 16;
        btn.style.left = `${btnLeft}px`;
        btn.style.top = `${dockTop}px`;
        modal.style.left = `${safeModalLeft}px`;
        modal.style.top = `${dockTop + (btnRect.height / 2) - (modalHeight / 2)}px`;
    });
}

// Toggle modal
btn.addEventListener('click', e => {
    if (dragMoved) return;
    if (!modal.classList.contains('active')) {
        // Save last pos
        lastBtnPos = {
            left: btn.style.left,
            top: btn.style.top,
        };
        dockBtnAndModal();
        modal.classList.add('active');
        // threadList.style.display = 'none';
    } else {
        moveBtnAndModal(lastBtnPos.left, lastBtnPos.top);
        modal.classList.remove('active')
    }
    // const btnRect = btn.getBoundingClientRect();
    // modal.style.visibility = 'hidden';
    // modal.style.display = 'flex';
    // const modalHeight = modal.offsetHeight;
    // modal.style.display = '';
    // modal.style.visibility = '';
    // const top = btnRect.top + (btnRect.height / 2) - (modalHeight / 2);
    // const left = btnRect.left + (btnRect.width / 2);
    // modal.style.top = `${top}px`;
    // modal.style.left = `${left}px`;
    // modal.classList.toggle('active');
    // threadList.style.display = 'none';
});

// Toggle thread list
menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    // threadList.classList.add('active');
    threadList.classList.toggle('open');
    modal.classList.toggle('open-threads'), threadList.classList.contains('open');
});

// Open thread window
threadList.addEventListener('click', e => {
    const item = e.target.closest('.thread-item[data-thread-id]');
    if (!item) return;
    const threadId = item.dataset.threadId;
    // If already open
    if (threadBar.querySelector(`[data-thread-id="${threadId}]`)) return;

    // Fetch threads via AJAX (stub)
    fetch(`/messages/thread/${threadId}/json/`)
        .then(res => res.json())
        .then(data => {
            const win = document.createElement('div');
            win.className = 'thread-window';
            win.innerHTML = `
                <div class='thread-header'>
                    <span>${data.title}</span>
                    <span class='close-thread-btn' title='Close'>&times;</span>
                </div>
                <div class='thread-messages'>
                    ${data.messages.map(m => `<div>${m.sender}: ${m.text}</div>`).join('')}
                </div>
            `;
            threadBar.appendChild(win);
        })
        ;
});

// Close thread window
threadBar.addEventListener('click', e => {
    if (e.target.classList.container('close-thread-btn')) {
        const win = e.target.closest('.thread-window');
        if (win) win.remove();
    }
});

// Dismiss modal via btn
// modal.querySelector('.messages-bar').addEventListener('click', e => {
//     if (e.target.closest('#messages-menu-btn')) return; // Don't close if menuBtn
//     modal.classList.remove('active');
// });

// Touch drag logic
btn.addEventListener('touchstart', e => {
    dragging = true;
    // e.preventDefault();
    dragMoved = false;
    const touch = e.touches[0];
    offsetX = touch.clientX - btn.offsetLeft;
    offsetY = touch.clientY - btn.offsetTop;
    document.body.style.userSelect = 'none';
});

document.addEventListener('touchmove', e => {
    if (!dragging || modal.classList.contains('active')) return;
    e.preventDefault();
    dragMoved = true;
    const touch = e.touches[0];
    let minLeft = getMinBtnLeft();
    let x = touch.clientX - offsetX;
    if (x < minLeft) x = minLeft;
    let y = touch.clientY - offsetY;
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    modal.style.left = x + 'px';
    modal.style.top = y + 'px';

    // if (modal.classList.contains('active')) {
    //     const btnRect = btn.getBoundingClientRect();
    //     modal.style.visibility = 'hidden';
    //     modal.style.display = 'flex';
    //     const modalHeight = modal.offsetHeight;
    //     modal.style.display = '';
    //     modal.style.visibility = '';
    //     const top = btnRect.top + (btnRect.height / 2) - (modalHeight / 2);
    //     const left = btnRect.left + (btnRect.width / 2);
    //     modal.style.top = `${top}px`;
    //     modal.style.left = `${left}px`;
    // } else {
    //     modal.style.left = x + 'px';
    //     modal.style.top = y + 'px';
    // }
}, { passive: false });

document.addEventListener('touchend', e => {
    // e.preventDefault();
    if (dragging) {
        localStorage.setItem('messagesBtnPos', JSON.stringify({
            left: btn.style.left,
            top: btn.style.top
        }));
    }
    dragging = false;
    document.body.style.userSelect = '';
});