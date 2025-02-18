   
    // 스토리지 키 설정
    const STORAGE_KEY_PREFIX = 'prosemirror_preset_';
    const ACTIVE_PRESET_KEY = 'prosemirror_active_presets';
    
    // 스토리지에서 현재 활성화된 프리셋 정보 불러오기
    let activePresets = GM_getValue(ACTIVE_PRESET_KEY, {});
    
    // 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .preset-container {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 5px;
            background: #f5f5f5;
            padding: 5px;
            border-radius: 4px;
        }
        .preset-button {
            margin: 2px;
            padding: 4px 8px;
            cursor: pointer;
            border: 1px solid #ccc;
            border-radius: 3px;
            background: #fff;
        }
        .preset-button.active {
            background: #007bff;
            color: white;
            border-color: #0069d9;
        }
        .preset-container-wrapper {
            position: relative;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
    
    // MutationObserver 초기화: DOM 변경 감지
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                checkForProseMirror();
            }
        }
    });
    
    // 문서 전체 관찰 시작
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 초기 실행
    checkForProseMirror();
    
    // ProseMirror 클래스를 가진 요소 탐색 및 처리
    function checkForProseMirror() {
        const proseMirrorDivs = document.querySelectorAll('.ProseMirror');
        proseMirrorDivs.forEach((div, index) => {
            if (!div.hasAttribute('data-preset-initialized')) {
                initializePresetContainer(div, index);
            }
        });
    }
    
    // 프리셋 컨테이너 초기화
    function initializePresetContainer(proseMirrorDiv, index) {
        // 이미 초기화되었는지 확인
        if (proseMirrorDiv.hasAttribute('data-preset-initialized')) {
            return;
        }
        
        // 초기화 표시
        proseMirrorDiv.setAttribute('data-preset-initialized', 'true');
        
        // 현재 내용을 0번 프리셋으로 저장
        const currentContent = proseMirrorDiv.innerHTML;
        savePreset(index, 0, currentContent);
        
        // 활성화된 프리셋 확인 (기본값은 0)
        const activePresetIndex = activePresets[index] !== undefined ? activePresets[index] : 0;
        
        // 프리셋 컨테이너 생성
        const presetContainerWrapper = document.createElement('div');
        presetContainerWrapper.className = 'preset-container-wrapper';
        
        const presetContainer = document.createElement('div');
        presetContainer.className = 'preset-container';
        presetContainerWrapper.appendChild(presetContainer);
        
        // 프리셋 버튼 생성
        for (let presetIndex = 0; presetIndex < 6; presetIndex++) {
            const button = document.createElement('button');
            button.className = 'preset-button' + (presetIndex === activePresetIndex ? ' active' : '');
            button.textContent = `프리셋 ${presetIndex}`;
            button.dataset.presetIndex = presetIndex;
            
            button.addEventListener('click', function() {
                loadPreset(index, presetIndex, proseMirrorDiv);
                
                // 활성화 버튼 표시 업데이트
                presetContainer.querySelectorAll('.preset-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // 활성화된 프리셋 저장
                activePresets[index] = presetIndex;
                GM_setValue(ACTIVE_PRESET_KEY, activePresets);
            });
            
            presetContainer.appendChild(button);
        }
        
        // 프로즈미러 div 앞에 프리셋 컨테이너 삽입
        const parent = proseMirrorDiv.parentNode;
        if (parent) {
            parent.insertBefore(presetContainerWrapper, proseMirrorDiv);
        } else {
            // 부모가 없는 경우를 대비한 예외 처리
            const wrapperDiv = document.createElement('div');
            wrapperDiv.appendChild(presetContainerWrapper);
            wrapperDiv.appendChild(proseMirrorDiv.cloneNode(true));
            proseMirrorDiv.replaceWith(wrapperDiv);
        }
        
        // 초기 활성화된 프리셋 적용
        if (activePresetIndex !== 0) {
            loadPreset(index, activePresetIndex, proseMirrorDiv);
        }
        
        // 내용 변경 감지 및 자동 저장
        setupContentChangeListener(proseMirrorDiv, index, activePresetIndex);
    }
    
    // 내용 변경 감지 및 자동 저장 설정
    function setupContentChangeListener(proseMirrorDiv, divIndex, presetIndex) {
        // MutationObserver를 사용하여 내용 변경 감지
        const contentObserver = new MutationObserver(() => {
            savePreset(divIndex, presetIndex, proseMirrorDiv.innerHTML);
        });
        
        contentObserver.observe(proseMirrorDiv, { 
            childList: true, 
            subtree: true, 
            characterData: true, 
            attributes: true 
        });
        
        // input 이벤트도 감지
        proseMirrorDiv.addEventListener('input', () => {
            savePreset(divIndex, presetIndex, proseMirrorDiv.innerHTML);
        });
    }
    
    // 프리셋 저장 함수
    function savePreset(divIndex, presetIndex, content) {
        const key = `${STORAGE_KEY_PREFIX}${divIndex}_${presetIndex}`;
        GM_setValue(key, content);
    }
    
    // 프리셋 불러오기 함수
    function loadPreset(divIndex, presetIndex, proseMirrorDiv) {
        const key = `${STORAGE_KEY_PREFIX}${divIndex}_${presetIndex}`;
        const savedContent = GM_getValue(key, '');
        
        if (savedContent) {
            // ProseMirror 내용 변경
            proseMirrorDiv.innerHTML = savedContent;
            
            // ProseMirror 이벤트 발생시키기 (내용 변경 감지를 위해)
            triggerInputEvent(proseMirrorDiv);
        }
    }
    
    // 입력 이벤트 트리거 함수
    function triggerInputEvent(element) {
        const event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(event);
    }
    
    // 페이지 로드 시, 각 ProseMirror에 활성 프리셋 적용
    window.addEventListener('load', () => {
        setTimeout(checkForProseMirror, 1000); // 페이지 완전히 로드 후 실행
    });
