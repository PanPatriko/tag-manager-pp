function adjustPosition(x, y, contextMenu) { 
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (x + menuWidth > windowWidth) {
        contextMenu.style.left = `${windowWidth - menuWidth}px`;
    }
    if (y + menuHeight > windowHeight) {
        contextMenu.style.top = `${windowHeight - menuHeight}px`;
    }
}

export const contextMenuView = {
    showMenu(x, y, items) {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.top = `${y}px`;
        menu.style.left = `${x}px`;

        items.forEach(item => {
            if(item.type === 'button') {
                const btn = document.createElement('button');
                btn.textContent = item.label;
                btn.onclick = item.onClick;
                menu.appendChild(btn);
            }

            else if (item.type === 'checkbox') {
                const div = document.createElement('div');
                div.className = 'checkbox-container';
            
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = item.checked;
            
                input.onchange = item.onchange;
            
                const label = document.createElement('label');
                label.textContent = item.label;
                
                div.appendChild(label);
                div.appendChild(input);
                menu.appendChild(div);
            }
        });

        document.body.appendChild(menu);
        adjustPosition(x, y, menu);
    },
    
    hideMenu(event) {
        const menu = document.querySelector('.context-menu');
        if (event.target.closest('.checkbox-container')) {
            return;
        }
        if (menu) menu.remove();
    }
};