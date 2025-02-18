

(function() {
    'use strict';

    // 모든 ProseMirror 인스턴스를 찾는 함수
    function getAllProseMirrorInstances() {
        return Array.from(document.querySelectorAll('div.ProseMirror'));
    }

    // ProseMirror 인스턴스의 텍스트를 추출하는 함수
    function extractTextFromProseMirror(proseMirrorDiv) {
        return proseMirrorDiv.innerText || proseMirrorDiv.textContent;
    }

    // 안내 div를 생성하고 스타일을 적용하는 함수
    function createInfoDiv() {
        const infoDiv = document.createElement('div');
        infoDiv.style.position = 'fixed';
        infoDiv.style.bottom = '20px';
        infoDiv.style.right = '20px';
        infoDiv.style.width = '300px';
        infoDiv.style.height = '300px';
        infoDiv.style.backgroundColor = 'white';
        infoDiv.style.border = '1px solid #ccc';
        infoDiv.style.overflowY = 'auto';
        infoDiv.style.padding = '10px';
        infoDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        infoDiv.style.zIndex = '10000';
        infoDiv.innerHTML = '<h3>ProseMirror Text</h3><ul id="proseMirrorTextList"></ul>';
        document.body.appendChild(infoDiv);
        return infoDiv;
    }

    // 메인 함수
    function main() {
        const proseMirrorDivs = getAllProseMirrorInstances();
        const infoDiv = createInfoDiv();
        const textList = infoDiv.querySelector('#proseMirrorTextList');

        proseMirrorDivs.forEach((div, index) => {
            const text = extractTextFromProseMirror(div);
            const listItem = document.createElement('li');
            listItem.textContent = `ProseMirror ${index + 1}: ${text}`;
            textList.appendChild(listItem);
        });
    }

    // 페이지 로드 후 실행
    window.addEventListener('load', main);
})();
