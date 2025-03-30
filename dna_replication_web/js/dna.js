class DNA {
    constructor() {
        this.baseWidth = 30;  // 碱基宽度
        this.baseHeight = 22.5; // 碱基高度增加到1.5倍
        this.chainSpacing = 60; // 双链间距
        this.baseSpacing = 50; // 碱基之间的间距
        this.scale = 1; // 缩放比例
        this.sequence = this.generateRandomSequence(8); // 生成8个碱基对的随机序列
        this.upperOffset = 45; // 上链偏移量
        
        // 新增：解旋酶相关属性
        this.helicaseSize = 130;
        this.helicaseX = -width/2 + 200; // 初始位置在左侧
        this.helicaseY = -250;
        this.isDragging = false;
        this.isAttached = false;
        this.helicaseProgress = 0;
        this.hydrogenBondProgress = 0;
        this.animationStartTime = 0;
        this.isAnimating = false;
        this.isUnwindComplete = false; // 标记解旋是否完成

        // 新增：DNA双链间距变化相关属性
        this.chainSpacingProgress = 0; // 间距变化进度
        this.maxChainSpacingIncrease = 1.6; // 最大间距增加比例（90%）
        this.chainSpacingDelay = 3.5 * 60; // 延迟3秒（120帧）
        this.chainSpacingDuration = 1.5 * 60; // 持续2秒（180帧）

        // 新增：按钮相关属性
        this.buttonSize = 60; // 按钮大小
        this.buttonSpacing = 80; // 按钮之间的间距
        this.buttonX = -width/2 + 200; // 按钮X位置（与解旋酶对齐）
        this.buttonY = -200; // 第一个按钮的Y位置（在解旋酶下方）

        // 新增：碱基拖拽相关属性
        this.draggingBase = null; // 当前正在拖拽的碱基
        this.draggingBaseIndex = -1; // 当前拖拽的碱基索引
        this.isDraggingBase = false; // 是否正在拖拽碱基
        this.baseStartPos = { x: 0, y: 0 }; // 碱基起始位置
        this.baseOriginalPos = { x: 0, y: 0 }; // 碱基原始位置
        this.isReplicationComplete = false; // DNA复制是否完成
        
        // 新增：固定的碱基数组
        this.fixedBases = [];  // 存储所有固定的碱基 {type, x, y, index}
        
        // 新增：碱基配对连接
        this.basePairConnections = []; // 存储配对连接 {index, isAT}
        
        // 新增：当前可配对的最左索引
        this.currentPairableIndex = this.sequence.length - 1; // 从最右侧开始
        
        // 修改：解旋酶移动标志
        this.helicaseMovedLeft = false; // 解旋酶是否已移动
        this.helicaseRightOffset = 400; // 解旋酶向右移动的距离（4cm约等于400像素）
        
        // 修改：DNA聚合酶相关属性
        this.polymeraseSize = 120; // 聚合酶大小
        this.polymeraseX = -width/2 + 200; // 初始X位置与解旋酶相同
        this.polymeraseY = -100; // 初始Y位置在解旋酶下方
        this.isDraggingPolymerase = false; // 是否正在拖拽聚合酶
        
        // 修改：去除聚合动画相关属性，改为自动跟随碱基
        this.isPolymeraseVisible = true; // 是否显示聚合酶
        this.topChainSynthesisComplete = false; // 上链合成是否完成
        
        // 新增：上链聚合相关状态
        this.topChainRectProgress = 0; // 上链矩形绘制进度(0-100)
        
        // 新增：DNA双链之间的矩形
        this.midRectWidth = 20; // 中间矩形宽度(0.5cm约50像素)
        this.midRectColor = color(150, 150, 150, 255); // 完全不透明的灰色
        this.topChainRectComplete = false; // 标记上链矩形是否完成
        this.bottomChainRectComplete = false; // 标记下链矩形是否完成
        
        // 新增：下链碱基配对相关属性
        this.isBottomChainReady = false; // 下链是否准备好进行配对
        this.currentBottomPairableIndex = 0; // 从左侧开始配对下链
        this.fixedBottomBases = []; // 存储固定在下链上方的碱基 {type, x, y, index}
        this.bottomPairConnections = []; // 存储下链配对连接 {index, isAT}
        
        // 新增：下链聚合相关属性
        this.isBottomChainPolymerizing = false; // 标记为下链聚合
        this.isBottomChainPolymerizingStarted = false; // 标记下链聚合是否已开始
        
        // 新增：完成状态
        this.isCompleted = false; // 整个DNA复制过程是否完成
        this.isCompleting = false; // 是否正在完成过程中（1秒延迟）
        this.completionDelayCounter = 0; // 完成延迟计数器
        this.completionDelayFrames = 60; // 1秒延迟(60帧)
        this.completionMessage = "恭喜你完成了DNA分子的复制！"; // 完成后显示的消息
        this.messageDelayFrames = 60; // 1秒延迟(60帧)
        this.messageDelayCounter = 0; // 延迟计数器
        this.showMessage = false; // 是否显示消息

        // 新增：按钮状态
        this.isUnwindButtonDisabled = false; // 解旋按钮是否禁用

        // 新增：聚合酶进度相关属性
        this.polymeraseProgress = 0; // 聚合酶进度
        this.bottomChainPolymeraseProgress = 0; // 下链聚合酶进度(0-100)
    }

    generateRandomSequence(length) {
        const bases = ['A', 'T', 'C', 'G'];
        const sequence = [];
        for (let i = 0; i < length; i++) {
            const base1 = bases[Math.floor(Math.random() * bases.length)];
            let base2;
            switch(base1) {
                case 'A': base2 = 'T'; break;
                case 'T': base2 = 'A'; break;
                case 'C': base2 = 'G'; break;
                case 'G': base2 = 'C'; break;
            }
            sequence.push({top: base1, bottom: base2});
        }
        return sequence;
    }

    draw() {
        push();
        translate(width/2, height/2);
        scale(this.scale);

        // 计算DNA链的总宽度
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;

        // 计算当前间距
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));

        // 先绘制骨架
        fill(180, 180, 180);
        noStroke(); // 移除边框
        rect(startX - 26, -currentSpacing/2 - 25 - this.upperOffset, totalWidth + 10, 30);
        rect(startX - 26, currentSpacing/2, totalWidth + 10, 30);

        // 绘制上链碱基
        for (let i = 0; i < this.sequence.length; i++) {
            const x = startX + i * this.baseSpacing;
            this.drawBase(x, -currentSpacing/2 + 15 - this.upperOffset, this.sequence[i].top, true);
        }

        // 绘制下链碱基
        for (let i = 0; i < this.sequence.length; i++) {
            const x = startX + i * this.baseSpacing;
            this.drawBase(x, currentSpacing/2 - 11.25, this.sequence[i].bottom, false);
        }

        // 绘制碱基对之间的氢键
        for (let i = 0; i < this.sequence.length; i++) {
            const x = startX + i * this.baseSpacing;
            this.drawHydrogenBonds(x, totalWidth, currentSpacing);
        }

        // 绘制5'和3'标记
        this.drawEndLabels(startX, totalWidth, currentSpacing);

        // 绘制解旋酶
        this.drawHelicase();

        // 绘制按钮
        this.drawButtons();
        
        // 绘制当前可配对的碱基指示器（上链或下链）
        if (this.isReplicationComplete && !this.topChainSynthesisComplete) {
            this.drawPairableIndicator();
        } else if (this.isBottomChainReady && !this.isCompleted) {
            this.drawBottomPairableIndicator();
        }

        // 绘制拖拽中的碱基
        this.drawDraggingBase();
        
        // 绘制固定的碱基
        this.drawFixedBases();
        
        // 绘制碱基配对连接(虚线)
        this.drawBasePairConnections(startX, currentSpacing);
        
        // 绘制固定在下链上方的碱基
        this.drawFixedBottomBases();
        
        // 绘制下链碱基配对连接(虚线)
        this.drawBottomPairConnections(startX, currentSpacing);
        
        // 如果上链矩形已完成，始终绘制完整的上链矩形
        if (this.topChainRectComplete) {
            this.drawCompletedTopChainRect(startX, totalWidth);
        } else if (this.fixedBases.length > 0) {
            // 根据已配对的碱基数量绘制部分上链矩形
            this.drawPartialTopChainRect(startX, totalWidth);
        }
        
        // 如果下链矩形已完成，始终绘制完整的下链矩形
        if (this.bottomChainRectComplete) {
            this.drawCompletedBottomChainRect(startX, totalWidth, currentSpacing);
        } else if (this.fixedBottomBases.length > 0) {
            // 根据已配对的碱基数量绘制部分下链矩形
            this.drawPartialBottomChainRect(startX, totalWidth, currentSpacing);
        }
        
        // 处理完成延迟，先让聚合酶回到初始位置，再显示消息
        if (this.isCompleting && !this.isCompleted) {
            this.completionDelayCounter++;
            
            if (this.completionDelayCounter >= this.completionDelayFrames) {
                // 将聚合酶移回初始位置
                this.polymeraseX = -width/2 + 200;
                this.polymeraseY = -100;
                
                // 完成整个过程
                this.isCompleted = true;
                this.showMessage = true; // 立即显示消息
                this.isCompleting = false;
                
                console.log("DNA复制完成！聚合酶已移回初始位置，显示完成消息");
            }
        }
        
        // 绘制DNA聚合酶，只有在需要时才显示
        if (this.isPolymeraseVisible && !this.isCompleted) {
            this.drawPolymerase();
        }
        
        // 绘制完成消息
        if (this.showMessage) {
            this.drawCompletionMessage();
        }
        
        // 添加解旋完成但聚合酶未固定的提示（若需要）
        if (this.isUnwindComplete && !this.isReplicationComplete) {
            this.drawPolymeraseHint();
        }
        
        // 在右下角添加版权信息
        this.drawCopyright();

        pop();
    }

    drawBase(x, y, base, isTop) {
        // 绘制碱基
        let baseColor;
        switch(base) {
            case 'A': baseColor = [46, 139, 87]; break;    // 绿色
            case 'T': baseColor = [238, 238, 0]; break; // 黄色
            case 'C': baseColor = [205, 92, 92]; break;    // 蓝色
            case 'G': baseColor = [200, 200, 255]; break; // 浅蓝色
        }
        fill(baseColor);
        
        // 绘制碱基矩形
        rect(x - this.baseWidth/2, y - this.baseHeight/2, this.baseWidth, this.baseHeight);
        
        // 绘制碱基字母
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text(base, x, y);
    }

    drawHydrogenBonds(x, totalWidth, currentSpacing) {
        stroke(0);
        strokeWeight(1);
        
        const basePair = this.sequence[Math.floor((x + totalWidth/2) / this.baseSpacing)];
        const isAT = (basePair.top === 'A' && basePair.bottom === 'T') || 
                    (basePair.top === 'T' && basePair.bottom === 'A');
        
        const numBonds = isAT ? 2 : 3;
        const bondSpacing = 8;
        
        // 计算当前碱基对的位置进度
        const basePairIndex = Math.floor((x + totalWidth/2) / this.baseSpacing);
        const basePairProgress = (basePairIndex / this.sequence.length) * 100;
        
        // 如果当前碱基对的位置小于氢键消失进度，则不绘制（从左到右消失）
        if (basePairProgress < this.hydrogenBondProgress) return;
        
        for (let i = 0; i < numBonds; i++) {
            const offset = (i - (numBonds-1)/2) * bondSpacing;
            for (let y = -currentSpacing/2 + 28 - this.upperOffset; y <= currentSpacing/2 - 18.25; y += 10) {
                line(x + offset, y, x + offset, y + 4);
            }
        }
    }

    drawEndLabels(startX, totalWidth, currentSpacing) {
        // 绘制5'标记
        fill(0);
        textAlign(LEFT, CENTER);
        textSize(20);
        text("5'", startX - 70, -currentSpacing/2 - this.upperOffset);
        text("3'", startX - 70, currentSpacing/2);

        // 绘制3'标记
        textAlign(RIGHT, CENTER);
        text("3'", startX + totalWidth + 30, -currentSpacing/2 - this.upperOffset);
        text("5'", startX + totalWidth + 30, currentSpacing/2);
    }

    drawHelicase() {
        push();
        fill(255, 165, 0); // 橙色
        noStroke();
        const pos = this.getHelicasePosition();
        ellipse(pos.x, pos.y, this.helicaseSize, this.helicaseSize);
        
        // 添加文字
        fill(0); // 黑色文字
        textAlign(CENTER, CENTER);
        textSize(20);
        text("DNA解旋酶", pos.x, pos.y);
        
        pop();
    }

    isNearDNAStart() {
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const pos = this.getHelicasePosition();
        
        // 计算与左端的距离
        const distanceToStart = dist(pos.x, pos.y, startX, 0);
        
        // 下链配对完成后，不允许使用此方法固定解旋酶（将由isNearBottomChainStart处理）
        if (this.isBottomChainReady && this.fixedBottomBases.length === this.sequence.length) {
            return false;
        }
        
        // 允许在左端固定解旋酶
        return distanceToStart < this.helicaseSize/2;
    }

    updateHelicasePosition(x, y) {
        if (!this.isAttached) {
            this.helicaseX = x;
            this.helicaseY = y;
        }
    }

    startHelicaseAnimation() {
        // 如果解旋按钮已禁用，则直接返回
        if (this.isUnwindButtonDisabled) {
            console.log("DNA已解旋完成，请按动重置按钮重新开始");
            return;
        }
        
        if (this.isAttached && !this.isAnimating) {
            this.isAnimating = true;
            this.animationStartTime = frameCount;
            this.helicaseProgress = 0;
            this.hydrogenBondProgress = 0;
            this.chainSpacingProgress = 0;
        }
    }

    updateAnimation() {
        if (!this.isAnimating) return;

        // 解旋酶和氢键动画
        if (this.isAnimating) {
            const animationDuration = 5 * 60; // 5秒 * 60帧/秒
            const currentProgress = (frameCount - this.animationStartTime) / animationDuration;
            
            if (currentProgress >= 1) {
                this.isAnimating = false;
                this.helicaseProgress = 100;
                this.hydrogenBondProgress = 100;
                this.chainSpacingProgress = 100;
                // 修改：解旋后不立即设置为复制完成，而是等待聚合酶固定
                // this.isReplicationComplete = true; // 注释掉这一行
                // 解旋完成后设置聚合酶相关状态
                this.isUnwindButtonDisabled = true; // 解旋完成后禁用解旋按钮
                this.setupPolymeraseForTopChain();
                return;
            }

            // 更新解旋酶和氢键进度
            this.helicaseProgress = currentProgress * 100;
            this.hydrogenBondProgress = currentProgress * 100;

            // 更新DNA双链间距进度
            const timeSinceStart = frameCount - this.animationStartTime;
            if (timeSinceStart >= this.chainSpacingDelay) {
                const spacingProgress = (timeSinceStart - this.chainSpacingDelay) / this.chainSpacingDuration;
                this.chainSpacingProgress = min(spacingProgress * 100, 100);
            }
        }
    }

    getHelicasePosition() {
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const endX = startX + totalWidth;
        
        if (this.isAttached) {
            // 计算基本位置
            let baseX = startX + (endX - startX) * (this.helicaseProgress / 100);
            
            // 如果解旋酶已经完成动画并且标记为移动，则应用右移偏移
            if (this.isReplicationComplete && this.helicaseMovedLeft) {
                baseX += this.helicaseRightOffset; // 向右移动
            }
            
            return {
                x: baseX,
                y: 0
            };
        }
        
        return {
            x: this.helicaseX,
            y: this.helicaseY
        };
    }

    setScale(newScale) {
        this.scale = constrain(newScale, 1, 2); // 限制缩放范围在1-2之间
    }

    // 新增：绘制按钮
    drawButtons() {
        push();
        
        // 绘制4个按钮
        for (let i = 0; i < 4; i++) {
            const y = this.buttonY + i * this.buttonSpacing + 230;
            
            // 如果有图片，直接绘制图片，不绘制灰色背景
            if (buttonImages[i]) {
                imageMode(CENTER);
                image(buttonImages[i], this.buttonX, y, 
                      this.buttonSize * 0.8, this.buttonSize * 0.8);
                imageMode(CORNER);
            } else {
                // 如果图片未加载，仍然显示文字，但不显示背景
                fill(0);
                textAlign(CENTER, CENTER);
                textSize(12);
                text(['C', 'G', 'A', 'T'][i], this.buttonX, y);
            }
        }
        
        pop();
    }

    // 修改：检查按钮点击，支持下链配对
    checkButtonClick(x, y) {
        if (this.isDraggingBase) return false;
        
        // 上链配对阶段 - 必须等上链聚合完成后才允许上链配对
        if (this.isReplicationComplete && !this.topChainSynthesisComplete) {
            for (let i = 0; i < 4; i++) {
                const buttonY = this.buttonY + i * this.buttonSpacing + 230;
                const distance = dist(x, y, this.buttonX, buttonY);
                
                if (distance < this.buttonSize/2) {
                    this.startBaseDrag(i, true); // 上链配对
                    return true;
                }
            }
        }
        // 下链配对阶段
        else if (this.isBottomChainReady) {
            for (let i = 0; i < 4; i++) {
                const buttonY = this.buttonY + i * this.buttonSpacing + 230;
                const distance = dist(x, y, this.buttonX, buttonY);
                
                if (distance < this.buttonSize/2) {
                    this.startBaseDrag(i, false); // 下链配对
                    return true;
                }
            }
        }
        
        return false;
    }

    // 新增：开始碱基拖拽，支持下链配对
    startBaseDrag(buttonIndex, isTopChain) {
        const baseTypes = ['C', 'G', 'A', 'T'];
        const base = baseTypes[buttonIndex];
        
        this.draggingBase = {
            type: base,
            x: this.buttonX,
            y: this.buttonY + buttonIndex * this.buttonSpacing + 230,
            isTopChain: isTopChain // 标记是上链还是下链配对
        };
        
        this.baseStartPos = { x: this.buttonX, y: this.buttonY + buttonIndex * this.buttonSpacing + 230 };
        this.baseOriginalPos = { x: this.buttonX, y: this.buttonY + buttonIndex * this.buttonSpacing + 230 };
        this.isDraggingBase = true;
        
        // 如果解旋酶尚未向左移动，则移动它
        if (!this.helicaseMovedLeft) {
            this.helicaseMovedLeft = true;
        }
    }

    // 新增：更新碱基拖拽
    updateBaseDrag(x, y) {
        if (!this.isDraggingBase) return;

        this.draggingBase.x = x;
        this.draggingBase.y = y;
    }

    // 新增：结束碱基拖拽，支持下链配对
    endBaseDrag() {
        if (!this.isDraggingBase) return;

        // 检查是哪个链的配对
        if (this.draggingBase.isTopChain) {
            this.endTopChainBaseDrag(); // 上链配对处理
        } else {
            this.endBottomChainBaseDrag(); // 下链配对处理
        }
    }

    // 新增：处理上链碱基拖拽结束
    endTopChainBaseDrag() {
        // 计算DNA链的总宽度和起始位置
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));

        // 检查是否在DNA链上
        const baseIndex = Math.floor((this.draggingBase.x - startX) / this.baseSpacing);
        if (baseIndex >= 0 && baseIndex < this.sequence.length) {
            // 只允许配对当前可配对的碱基索引
            if (baseIndex !== this.currentPairableIndex) {
                // 提示用户需要从右到左依次配对
                console.log("请从右到左依次配对碱基！");
                this.draggingBase.x = this.baseOriginalPos.x;
                this.draggingBase.y = this.baseOriginalPos.y;
                this.isDraggingBase = false;
                this.draggingBase = null;
                return;
            }
            
            const targetY = -currentSpacing/2 + 35 - this.upperOffset;
            const yDistance = Math.abs(this.draggingBase.y - targetY);
            
            // 计算X轴距离，允许在碱基中心点左右一定范围内配对
            const baseX = startX + baseIndex * this.baseSpacing;
            const xDistance = Math.abs(this.draggingBase.x - baseX);

            // 检查是否在正确的Y位置范围内
            if (yDistance < 150 && xDistance < this.baseWidth + 80) {
                // 检查配对规则
                const topBase = this.sequence[baseIndex].top;
                const isPaired = this.checkBasePairing(this.draggingBase.type, topBase);

                if (isPaired) {
                    // 配对成功，固定碱基在上链下方
                    // 计算新的位置：上链碱基坐标 + 垂直偏移
                    const fixedX = startX + baseIndex * this.baseSpacing;
                    const fixedY = targetY + 20; // 上链位置下方
                    
                    // 添加到固定碱基数组
                    this.fixedBases.push({
                        type: this.draggingBase.type,
                        x: fixedX,
                        y: fixedY,
                        index: baseIndex
                    });
                    
                    // 添加碱基配对连接
                    const isAT = (topBase === 'A' && this.draggingBase.type === 'T') || 
                               (topBase === 'T' && this.draggingBase.type === 'A');
                    
                    this.basePairConnections.push({
                        index: baseIndex,
                        isAT: isAT,
                        fixedY: fixedY
                    });
                    
                    // 更新当前可配对的索引，向左移动一位
                    this.currentPairableIndex = Math.max(0, this.currentPairableIndex - 1);
                    
                    // 不修改DNA序列的底链信息
                    this.isDraggingBase = false;
                    this.draggingBase = null;
                    
                    // 新增：自动移动聚合酶位置，向左移动0.5cm (50像素)
                    this.updatePolymeraseWithBasePair(baseIndex);
                    
                    // 检查是否所有碱基都已配对
                    if (this.currentPairableIndex === 0 && this.fixedBases.length === this.sequence.length) {
                        console.log("所有上链碱基都已配对成功！");
                        // 所有碱基配对完成后，将聚合酶移回初始位置
                        this.finishTopChainSynthesis();
                    }
                    
                    return;
                }
            }
        }

        // 配对失败或位置不正确，返回原位
        this.draggingBase.x = this.baseOriginalPos.x;
        this.draggingBase.y = this.baseOriginalPos.y;
        this.isDraggingBase = false;
        this.draggingBase = null;
    }
    
    // 修改：处理下链碱基拖拽结束，更新聚合酶位置
    endBottomChainBaseDrag() {
        // 计算DNA链的总宽度和起始位置
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));

        // 检查是否在DNA链上
        const baseIndex = Math.floor((this.draggingBase.x - startX) / this.baseSpacing);
        if (baseIndex >= 0 && baseIndex < this.sequence.length) {
            // 只允许配对当前可配对的下链碱基索引
            if (baseIndex !== this.currentBottomPairableIndex) {
                // 提示用户需要从左到右依次配对
                console.log("请从左到右依次配对下链碱基！");
                this.draggingBase.x = this.baseOriginalPos.x;
                this.draggingBase.y = this.baseOriginalPos.y;
                this.isDraggingBase = false;
                this.draggingBase = null;
                return;
            }
            
            const targetY = currentSpacing/2 - 11.25; // 下链碱基Y位置
            const yDistance = Math.abs(this.draggingBase.y - targetY);
            
            // 计算X轴距离，允许在碱基中心点左右一定范围内配对
            const baseX = startX + baseIndex * this.baseSpacing;
            const xDistance = Math.abs(this.draggingBase.x - baseX);

            // 检查是否在正确的Y位置范围内
            if (yDistance < 150 && xDistance < this.baseWidth + 80) {
                // 检查配对规则
                const bottomBase = this.sequence[baseIndex].bottom;
                const isPaired = this.checkBasePairing(this.draggingBase.type, bottomBase);

                if (isPaired) {
                    // 配对成功，固定碱基在下链上方更近的位置
                    const fixedX = startX + baseIndex * this.baseSpacing;
                    const fixedY = targetY - 40; // 下链位置上方0.3cm (30像素)
                    
                    // 添加到固定下链碱基数组
                    this.fixedBottomBases.push({
                        type: this.draggingBase.type,
                        x: fixedX,
                        y: fixedY,
                        index: baseIndex
                    });
                    
                    // 添加下链碱基配对连接
                    const isAT = (bottomBase === 'A' && this.draggingBase.type === 'T') || 
                               (bottomBase === 'T' && this.draggingBase.type === 'A');
                    
                    this.bottomPairConnections.push({
                        index: baseIndex,
                        isAT: isAT,
                        fixedY: fixedY
                    });
                    
                    // 更新当前可配对的下链索引，向右移动一位
                    this.currentBottomPairableIndex = Math.min(this.sequence.length - 1, this.currentBottomPairableIndex + 1);
                    
                    // 更新下链聚合酶位置和进度
                    this.updateBottomChainPolymerase();
                    
                    this.isDraggingBase = false;
                    this.draggingBase = null;
                    
                    // 检查是否所有下链碱基都已配对，并且当前是最右端的碱基
                    if (baseIndex === this.sequence.length - 1 && this.fixedBottomBases.length === this.sequence.length) {
                        console.log("所有下链碱基都已配对成功！DNA复制完成！最右端碱基配对完成！");
                        // 标记下链矩形已完成
                        this.bottomChainRectComplete = true;
                        
                        // 标记为正在完成过程中，开始1秒延迟
                        this.isCompleting = true;
                        this.completionDelayCounter = 0;
                        
                        console.log("开始1秒延迟后移动聚合酶并显示完成消息");
                        // 不立即调用finishBottomChainSynthesis()，而是在draw方法中处理延迟
                    }
                    
                    return;
                }
            }
        }

        // 配对失败或位置不正确，返回原位
        this.draggingBase.x = this.baseOriginalPos.x;
        this.draggingBase.y = this.baseOriginalPos.y;
        this.isDraggingBase = false;
        this.draggingBase = null;
    }

    // 新增：检查碱基配对
    checkBasePairing(base1, base2) {
        return (base1 === 'A' && base2 === 'T') ||
               (base1 === 'T' && base2 === 'A') ||
               (base1 === 'C' && base2 === 'G') ||
               (base1 === 'G' && base2 === 'C');
    }

    // 新增：绘制拖拽中的碱基
    drawDraggingBase() {
        if (!this.isDraggingBase || !this.draggingBase) return;

        // 计算调整后的灰色矩形尺寸
        const grayRectWidth = this.baseWidth * 1.3; // 宽度增加30%
        const grayRectHeight = this.baseHeight * 0.7; // 高度减少30%

        // 绘制灰色矩形，根据是上链还是下链配对，放在不同位置
        fill(180, 180, 180);
        noStroke(); // 移除边框
        
        if (this.draggingBase.isTopChain) {
            // 上链配对时，灰色矩形在下方
            rect(this.draggingBase.x - grayRectWidth/2, 
                 this.draggingBase.y + this.baseHeight/2, 
                 grayRectWidth, grayRectHeight);
        } else {
            // 下链配对时，灰色矩形在上方
            rect(this.draggingBase.x - grayRectWidth/2, 
                 this.draggingBase.y - this.baseHeight/2 - grayRectHeight, 
                 grayRectWidth, grayRectHeight);
        }
        
        // 绘制碱基
        let baseColor;
        switch(this.draggingBase.type) {
            case 'A': baseColor = [46, 139, 87]; break;    // 绿色
            case 'T': baseColor = [238, 238, 0]; break;   // 黄色
            case 'C': baseColor = [205, 92, 92]; break;   // 蓝色
            case 'G': baseColor = [200, 200, 255]; break; // 浅蓝色
        }
        fill(baseColor);
        
        // 绘制碱基矩形
        rect(this.draggingBase.x - this.baseWidth/2, 
             this.draggingBase.y - this.baseHeight/2, 
             this.baseWidth, this.baseHeight);
        
        // 绘制碱基字母
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text(this.draggingBase.type, this.draggingBase.x, this.draggingBase.y);
    }

    // 新增：绘制固定的碱基
    drawFixedBases() {
        if (this.fixedBases.length === 0) return;
        
        // 计算调整后的灰色矩形尺寸
        const grayRectWidth = this.baseWidth * 1.3; // 宽度增加30%
        const grayRectHeight = this.baseHeight * 0.7; // 高度减少30%
        
        for (let fixedBase of this.fixedBases) {
            // 先绘制下方的灰色矩形
            fill(150, 150, 150);
            noStroke(); // 移除边框
            rect(fixedBase.x - grayRectWidth/2, 
                 fixedBase.y + this.baseHeight/2, 
                 grayRectWidth, grayRectHeight);
                 
            // 绘制碱基
            let baseColor;
            switch(fixedBase.type) {
                case 'A': baseColor = [46, 139, 87]; break;    // 绿色
                case 'T': baseColor = [238, 238, 0]; break;   // 黄色
                case 'C': baseColor = [205, 92, 92]; break;   // 蓝色
                case 'G': baseColor = [200, 200, 255]; break; // 浅蓝色
            }
            fill(baseColor);
            
            // 绘制碱基矩形
            rect(fixedBase.x - this.baseWidth/2, 
                 fixedBase.y - this.baseHeight/2, 
                 this.baseWidth, this.baseHeight);
            
            // 绘制碱基字母
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(12);
            text(fixedBase.type, fixedBase.x, fixedBase.y);
        }
    }

    // 新增：绘制当前可配对的碱基指示器
    drawPairableIndicator() {
        // 只有在isReplicationComplete为true且尚未完成上链合成时才显示
        if (!this.isReplicationComplete || this.currentPairableIndex < 0 || this.topChainSynthesisComplete) return;

        // 计算DNA链的总宽度和起始位置
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        
        // 计算当前可配对的碱基位置
        const x = startX + this.currentPairableIndex * this.baseSpacing;
        const y = -currentSpacing/2 + 15 - this.upperOffset;
        
        // 绘制指示器（闪烁效果）
        push();
        noFill();
        stroke(190, 190, 190);
        strokeWeight(2);
        let alpha = map(sin(frameCount * 0.1), -1, 1, 100, 255);
        stroke(190, 190, 190, alpha);
        rect(x - this.baseWidth/2 - 5, y - this.baseHeight/2 - 5, 
             this.baseWidth + 10, this.baseHeight + 10, 5);
        pop();
    }

    // 修改：绘制DNA聚合酶
    drawPolymerase() {
        push();
        
        // 只有当聚合酶在屏幕内且可见时才绘制
        if (this.polymeraseX > -width && this.polymeraseX < width &&
            this.polymeraseY > -height && this.polymeraseY < height &&
            this.isPolymeraseVisible) {
                
            fill(0, 200, 0, 80); // 绿色，添加50%透明度
            noStroke();
            ellipse(this.polymeraseX, this.polymeraseY, this.polymeraseSize, this.polymeraseSize);
            
            // 添加文字，不使用闪烁效果
            fill(0); // 黑色文字
            textAlign(CENTER, CENTER);
            textSize(16);
            
            // 检查聚合酶位置，如果在下链附近则文字放在上方，否则放在下方
            if (this.isBottomChainPolymerizing || this.isBottomChainReady) {
                // 下链时，文字放在上方
                text("DNA聚合酶", this.polymeraseX, this.polymeraseY - this.polymeraseSize/3.5);
            } else {
                // 上链或其他位置时，文字放在下方
                text("DNA聚合酶", this.polymeraseX, this.polymeraseY + this.polymeraseSize/3.5);
            }
        }
        
        pop();
    }
    
    // 新增：检查是否点击了DNA聚合酶
    checkPolymeraseClick(x, y) {
        const distance = dist(x, y, this.polymeraseX, this.polymeraseY);
        return distance < this.polymeraseSize/2;
    }
    
    // 修改：检查DNA聚合酶是否在DNA右端附近
    isPolymeraseNearDNAEnd() {
        // 记录调用状态
        console.log("调用isPolymeraseNearDNAEnd - 下链准备状态:", this.isBottomChainReady, 
                    "下链碱基数:", this.fixedBottomBases.length, 
                    "序列长度:", this.sequence.length,
                    "聚合酶位置:", this.polymeraseX, this.polymeraseY,
                    "解旋完成状态:", this.isUnwindComplete);
        
        // 重要：明确阻止在下链配对完成后聚合酶固定到右端
        if (this.isBottomChainReady && this.fixedBottomBases.length === this.sequence.length) {
            console.log("下链配对已完成，严格限制：不允许聚合酶固定到上链右端");
            return false;
        }
        
        // 修改：只要解旋完成就可以固定聚合酶，不需要等待碱基配对
        if (!this.isUnwindComplete) {
            console.log("DNA解旋尚未完成，聚合酶不能固定到右端");
            return false;
        }
        
        // 如果已经完成上链聚合，不能再固定到右端
        if (this.polymerizingCompleted) {
            console.log("已完成上链聚合，不能再次固定到右端");
            return false;
        }

        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const endX = startX + totalWidth;
        const upperY = -this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100)) / 2 - this.upperOffset;
        
        // 检查聚合酶是否在DNA右端3cm(300像素)范围内
        // 计算与DNA右端的距离
        const distanceToEnd = dist(this.polymeraseX, this.polymeraseY, endX, 0);
        
        // 计算与DNA上链3'标记处的距离
        const distanceTo3Prime = dist(this.polymeraseX, this.polymeraseY, endX, upperY);
        
        // 若聚合酶在右端或上链3'标记附近，则可以固定
        const isNearEnd = distanceToEnd < 300 && abs(this.polymeraseY) < 100; // 原来的判断
        const isNear3Prime = distanceTo3Prime < 300; // 新增：检查是否在3'标记的3cm范围内
        
        const canFixed = isNearEnd || isNear3Prime;
        
        console.log("聚合酶右端位置检查 - 距右端:", distanceToEnd, 
                    "距3'标记:", distanceTo3Prime,
                    "Y距离:", abs(this.polymeraseY), 
                    "聚合酶位置:", this.polymeraseX, this.polymeraseY,
                    "右端位置:", endX,
                    "上链3'标记位置:", endX, upperY,
                    "是否在右端范围内:", isNearEnd,
                    "是否在3'标记范围内:", isNear3Prime,
                    "最终结果 - 可以固定:", canFixed);
        
        return canFixed;
    }
    
    // 修改：检查DNA聚合酶是否在DNA下链左端附近
    isPolymeraseNearBottomChainStart() {
        // 只有在所有下链碱基都配对完成后才能进行下链聚合
        if (!this.isBottomChainReady || this.fixedBottomBases.length < this.sequence.length) {
            console.log("下链配对未完成，不能固定聚合酶");
            return false;
        }

        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2; // 左端位置
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        
        // 计算聚合酶与DNA左端的距离
        const distanceToLeft = dist(this.polymeraseX, this.polymeraseY, startX, currentSpacing/2);
        
        // 计算与下链的垂直距离
        const bottomChainY = currentSpacing/2; 
        const yDistance = abs(this.polymeraseY - bottomChainY);
        
        console.log("下链聚合酶位置检查 - 距左端:", distanceToLeft, 
                    "Y距离:", yDistance, 
                    "下链Y坐标:", bottomChainY, 
                    "聚合酶位置:", this.polymeraseX, this.polymeraseY,
                    "下链碱基数:", this.fixedBottomBases.length, 
                    "序列长度:", this.sequence.length,
                    "检测范围:", 50);
        
        // 需要在左端附近(0.5cm内，50像素)并且垂直方向也在合适范围内(2cm内)
        return distanceToLeft < 50 && yDistance < 200;
    }
    
    // 新增：检查解旋酶是否在下链左端附近
    isNearBottomChainStart() {
        // 只在下链配对完成后启用此检查
        if (!this.isBottomChainReady || this.fixedBottomBases.length < this.sequence.length) {
            return false;
        }
        
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2; // 左端位置
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        const pos = this.getHelicasePosition();
        
        // 计算与下链左端的距离
        const distanceToStart = dist(pos.x, pos.y, startX, currentSpacing/2);
        
        console.log("检查解旋酶位置 - 距下链左端:", distanceToStart, 
                  "解旋酶位置:", pos.x, pos.y,
                  "下链左端:", startX, currentSpacing/2);
        
        // 在下链左端附近时允许固定
        return distanceToStart < this.helicaseSize;
    }

    // 修改：绘制完成的上链矩形
    drawCompletedTopChainRect(startX, totalWidth) {
        const rectY = -50; // 矩形垂直居中于DNA双链之间
        
        push();
        fill(this.midRectColor);
        noStroke();
        // 向左偏移20像素
        rect(startX - 20, rectY - this.midRectWidth/2, totalWidth, this.midRectWidth);
        pop();
    }
    
    // 修改：绘制上链进行中的矩形
    drawTopChainInProgressRect(startX, totalWidth) {
        const endX = startX + totalWidth;
        const rectY = -50; // 矩形垂直居中于DNA双链之间
        
        // 根据聚合酶进度计算矩形的宽度
        const rectWidth = totalWidth * (this.polymeraseProgress / 100);
        
        push();
        fill(this.midRectColor);
        noStroke();
        // 从右到左绘制矩形，向左偏移20像素
        rect(endX - rectWidth - 20, rectY - this.midRectWidth/2, rectWidth, this.midRectWidth);
        pop();
    }
    
    // 修改：绘制下链矩形（从DNA左端到右端）
    drawBottomChainRect(startX, totalWidth, currentSpacing) {
        // 只在聚合酶开始移动后才显示灰色矩形
        if (this.polymeraseProgress <= 0) return;
        
        const rectY = currentSpacing/2 - 70; // 矩形在下链上方0.7cm处
        
        // 根据聚合酶进度计算矩形的宽度
        const rectWidth = totalWidth * (this.polymeraseProgress / 100);
        
        push();
        fill(this.midRectColor);
        noStroke();
        // 从左向右绘制矩形
        rect(startX, rectY - this.midRectWidth/2, rectWidth, this.midRectWidth);
        pop();
    }

    // 新增：绘制DNA双链之间的矩形
    drawMidRectangle(startX, totalWidth, currentSpacing) {
        // 此方法被上面新增的方法替代，保留为空以兼容现有代码
    }

    // 修改：更新DNA聚合酶位置
    updatePolymerasePosition(x, y) {
        console.log("更新聚合酶位置 - 原位置:", this.polymeraseX, this.polymeraseY, 
                    "新位置:", x, y);
        this.polymeraseX = x;
        this.polymeraseY = y;
    }

    // 新增：绘制完成消息
    drawCompletionMessage() {
        textAlign(CENTER, CENTER);
        textSize(34);
        
        // 添加闪烁效果（更强的闪烁）
        let alpha = map(sin(frameCount * 0.1), -1, 1, 100, 255);
        
        // 使用红色字体并添加黑色描边
        fill(0, 0, 0, alpha);
        stroke(0, 0, 0, alpha);
        strokeWeight(1);
        
        // 在画布上部中央显示消息
        text(this.completionMessage, 0, -height/3);
        
        // 恢复无描边状态
        noStroke();
        
        // 在画面右端下方绘制与DNA聚合酶相同的图案
        push();
        // 计算右下角位置
        const rightX = width/2 - 120; // 距离右边界100像素
        const bottomY = height/2 - 130; // 距离下边界100像素
        
        // 使用与DNA聚合酶相同的样式
        fill(0, 200, 0, 80); // 绿色，添加50%透明度
        noStroke();
        ellipse(rightX, bottomY, this.polymeraseSize, this.polymeraseSize);
        
        // 添加文字
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(16);
        // 文字放在绿色图案下方
        text("DNA聚合酶", rightX, bottomY);
        pop();
    }

    // 修改：重置功能
    reset() {
        // 重置解旋酶相关状态
        this.helicaseX = -width/2 + 200;
        this.helicaseY = -300;
        this.isDragging = false;
        this.isAttached = false;
        this.helicaseProgress = 0;
        this.hydrogenBondProgress = 0;
        this.animationStartTime = 0;
        this.isAnimating = false;
        this.isUnwindComplete = false; // 重置解旋完成状态
        
        // 重置DNA双链间距
        this.chainSpacingProgress = 0;
        
        // 重置按钮状态
        this.isUnwindButtonDisabled = false; // 重新激活解旋按钮
        
        // 重置碱基拖拽相关状态
        this.draggingBase = null;
        this.draggingBaseIndex = -1;
        this.isDraggingBase = false;
        this.isReplicationComplete = false;
        
        // 清空固定的碱基
        this.fixedBases = [];
        this.basePairConnections = [];
        this.currentPairableIndex = this.sequence.length - 1;
        
        // 重置解旋酶移动标志
        this.helicaseMovedLeft = false;
        
        // 重置DNA聚合酶相关状态
        this.polymeraseX = -width/2 + 200;
        this.polymeraseY = -100;
        this.isDraggingPolymerase = false;
        this.isPolymeraseVisible = true; // 重置聚合酶可见性
        this.topChainSynthesisComplete = false; // 重置上链合成状态
        this.topChainRectProgress = 0; // 重置上链矩形进度
        
        // 重置矩形完成状态
        this.topChainRectComplete = false;
        this.bottomChainRectComplete = false;
        
        // 重置下链相关状态
        this.isBottomChainReady = false;
        this.currentBottomPairableIndex = 0;
        this.fixedBottomBases = [];
        this.bottomPairConnections = [];
        this.isBottomChainPolymerizing = false;
        this.isBottomChainPolymerizingStarted = false;
        
        // 重置完成状态
        this.isCompleted = false;
        this.isCompleting = false;
        this.completionDelayCounter = 0;
        this.messageDelayCounter = 0;
        this.showMessage = false;
        
        // 重置聚合酶进度相关状态
        this.polymeraseProgress = 0;
        this.bottomChainPolymeraseProgress = 0;
        
        console.log("DNA复制过程已重置，可以重新开始");
    }

    // 修改：处理DNA聚合酶拖拽结束
    endPolymeraseDrag() {
        console.log("处理聚合酶拖拽结束 - 下链准备状态:", this.isBottomChainReady, 
                    "下链碱基数:", this.fixedBottomBases.length, 
                    "序列长度:", this.sequence.length,
                    "聚合酶位置:", this.polymeraseX, this.polymeraseY);
        
        // 下链配对完成后，检查是否固定到下链左端3'标记处
        if (this.isBottomChainReady && this.fixedBottomBases.length === this.sequence.length) {
            console.log("下链配对已完成，只能固定到下链左端3'标记处");
            
            // 强制重置固定状态，确保没有其他位置固定
            this.isPolymeraseAttached = false;
            this.isBottomChainPolymerizing = false;
            
            // 使用新的独立函数进行判断和固定
            // 函数内部会处理聚合酶的隐藏和在下链左端3'标记处生成相同图案
            const isFixed = this.checkAndFixPolymeraseToBottomChainStart();
            console.log("检查是否在3'标记附近的结果:", isFixed, 
                       "聚合酶固定状态:", this.isPolymeraseAttached);
            
            // 无论结果如何，都直接返回，防止后续代码执行
            return;
        }
        
        // 如果下链配对未完成，检查是否可以固定到上链右端
        console.log("下链配对未完成，检查是否可以固定到上链右端");
        
        // 重置固定状态，确保没有其他位置固定
        this.isPolymeraseAttached = false;
        this.isBottomChainPolymerizing = false;
        
        // 检查是否在DNA右端附近（上链聚合）
        if (this.isPolymeraseNearDNAEnd()) {
            this.isPolymeraseAttached = true;
            this.isBottomChainPolymerizing = false;
            
            // 设置聚合酶位置为DNA右端
            const totalWidth = this.sequence.length * this.baseSpacing;
            const startX = -totalWidth/2;
            const endX = startX + totalWidth;
            this.polymeraseX = endX;
            this.polymeraseY = -60;
            
            // 新增：当聚合酶固定到上链右端时，标记DNA复制可以开始
            this.isReplicationComplete = true;
            
            console.log("DNA聚合酶已固定到上链右端，可以开始配对碱基");
            return;
        }
        
        // 没有固定到任何位置
        this.isPolymeraseAttached = false;
        console.log("聚合酶未固定到任何位置");
    }

    // 修改：不再显示提示
    drawPolymeraseHint() {
        // 移除所有提示内容
    }

    // 新增：自动移动聚合酶位置，向左移动0.5cm (50像素)
    updatePolymeraseWithBasePair(baseIndex) {
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        
        // 计算聚合酶的新位置
        const newX = startX + baseIndex * this.baseSpacing;
        const newY = -60; // 固定Y位置在DNA上链附近
        
        // 更新聚合酶位置
        this.polymeraseX = newX;
        this.polymeraseY = newY;
    }

    // 修改：完成上链合成和准备下链配对
    finishTopChainSynthesis() {
        // 标记上链合成完成
        this.topChainSynthesisComplete = true;
        this.topChainRectComplete = true;
        
        // 将聚合酶移回初始位置
        this.polymeraseX = -width/2 + 200;
        this.polymeraseY = -100;
        
        // 准备下链配对
        this.prepareBottomChainPairing();
        
        console.log("上链合成完成！准备开始下链碱基配对");
    }

    // 修改：解旋完成后设置聚合酶相关状态但不自动固定到右端
    setupPolymeraseForTopChain() {
        // 标记解旋完成
        this.isUnwindComplete = true;
        
        // 标记聚合酶可见
        this.isPolymeraseVisible = true;
        
        // 标记DNA复制准备开始，但需要用户手动拖拽聚合酶到上链3'标记处
        // this.isReplicationComplete = true; // 不再自动设置为完成状态
        
        // 恢复聚合酶到初始位置，而不是固定到右端
        this.polymeraseX = -width/2 + 200;
        this.polymeraseY = -100;
        
        console.log("DNA解旋完成，请将DNA聚合酶拖拽到DNA上链3'标记附近");
    }

    // 新增：根据已配对的碱基数量绘制部分上链矩形
    drawPartialTopChainRect(startX, totalWidth) {
        if (this.fixedBases.length === 0) return;
        
        const rectY = -50; // 矩形垂直居中于DNA双链之间
        
        // 找出最左边已配对的碱基索引
        let leftmostIndex = this.sequence.length;
        for (let base of this.fixedBases) {
            leftmostIndex = Math.min(leftmostIndex, base.index);
        }
        
        // 计算矩形宽度，从DNA右端到最左边已配对碱基的位置
        const rectWidth = totalWidth - (leftmostIndex * this.baseSpacing);
        
        push();
        fill(this.midRectColor);
        noStroke();
        // 从DNA右端向左绘制矩形，宽度根据已配对的碱基决定
        rect(startX + leftmostIndex * this.baseSpacing, rectY - this.midRectWidth/2, rectWidth, this.midRectWidth);
        pop();
    }

    // 新增：完成下链合成和整个DNA复制过程
    finishBottomChainSynthesis() {
        // 标记下链矩形为完成状态
        this.bottomChainRectComplete = true;
        
        // 不立即标记为完成，而是延迟1秒，让动画先完成
        this.isCompleting = true;
        this.completionDelayCounter = 0;
        this.completionDelayFrames = 60; // 1秒延迟(60帧)
        
        console.log("DNA下链合成完成！DNA复制全部完成！等待1秒后显示消息");
    }

    // 新增：绘制碱基配对连接(虚线)
    drawBasePairConnections(startX, currentSpacing) {
        if (this.basePairConnections.length === 0) return;
        
        push();
        stroke(0);
        strokeWeight(1);
        
        for (let connection of this.basePairConnections) {
            const x = startX + connection.index * this.baseSpacing;
            const topY = -currentSpacing/2 + 15 - this.upperOffset + this.baseHeight/2;
            const bottomY = connection.fixedY - this.baseHeight/2;
            
            // 设置虚线样式
            drawingContext.setLineDash([5, 3]);
            
            // 根据碱基对类型绘制不同数量的虚线
            const numLines = connection.isAT ? 2 : 3;
            const lineSpacing = 8;
            
            for (let i = 0; i < numLines; i++) {
                const offset = (i - (numLines-1)/2) * lineSpacing;
                line(x + offset, topY, x + offset, bottomY);
            }
        }
        
        // 恢复实线样式
        drawingContext.setLineDash([]);
        pop();
    }

    // 新增：重置聚合酶到初始位置
    resetPolymerase() {
        this.polymeraseX = -width/2 + 200; // 回到初始X位置
        this.polymeraseY = -100; // 回到初始Y位置
    }
    
    // 新增：准备下链配对，自动固定聚合酶在左端
    prepareBottomChainPairing() {
        this.isBottomChainReady = true;
        this.currentBottomPairableIndex = 0; // 从左侧开始配对
        
        // 计算DNA链的总宽度和起始位置
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        
        // 自动固定聚合酶在下链左端
        this.polymeraseX = startX - 50;
        this.polymeraseY = currentSpacing/2 - 50; // 下链上方
        this.isPolymeraseAttached = true;
        this.isBottomChainPolymerizing = true;
        this.bottomChainPolymeraseProgress = 0; // 重置进度
        
        console.log("DNA聚合酶已自动固定在下链左端，准备开始下链碱基配对");
    }

    // 新增：绘制下链可配对的碱基指示器
    drawBottomPairableIndicator() {
        if (!this.isBottomChainReady || this.currentBottomPairableIndex >= this.sequence.length) return;

        // 计算DNA链的总宽度和起始位置
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        
        // 计算当前可配对的下链碱基位置
        const x = startX + this.currentBottomPairableIndex * this.baseSpacing;
        const y = currentSpacing/2 - 11.25; // 下链碱基的Y位置
        
        // 绘制指示器（闪烁效果）
        push();
        noFill();
        stroke(190, 190, 190); // 蓝色指示器区分上链的红色
        strokeWeight(2);
        let alpha = map(sin(frameCount * 0.1), -1, 1, 100, 255);
        stroke(190, 190, 190, alpha);
        rect(x - this.baseWidth/2 - 5, y - this.baseHeight/2 - 5, 
             this.baseWidth + 10, this.baseHeight + 10, 5);
        pop();
    }

    // 新增：绘制固定在下链上方的碱基
    drawFixedBottomBases() {
        if (this.fixedBottomBases.length === 0) return;
        
        // 计算调整后的灰色矩形尺寸
        const grayRectWidth = this.baseWidth * 1.3; // 宽度增加30%
        const grayRectHeight = this.baseHeight * 0.7; // 高度减少30%
        
        for (let fixedBase of this.fixedBottomBases) {
            // 先绘制上方的灰色矩形
            fill(150, 150, 150);
            noStroke(); // 移除边框
            rect(fixedBase.x - grayRectWidth/2, 
                 fixedBase.y - this.baseHeight/2 - grayRectHeight, 
                 grayRectWidth, grayRectHeight);
                 
            // 绘制碱基
            let baseColor;
            switch(fixedBase.type) {
                case 'A': baseColor = [46, 139, 87]; break;    // 绿色
                case 'T': baseColor = [238, 238, 0]; break;   // 黄色
                case 'C': baseColor = [205, 92, 92]; break;   // 蓝色
                case 'G': baseColor = [200, 200, 255]; break; // 浅蓝色
            }
            fill(baseColor);
            
            // 绘制碱基矩形
            rect(fixedBase.x - this.baseWidth/2, 
                 fixedBase.y - this.baseHeight/2, 
                 this.baseWidth, this.baseHeight);
            
            // 绘制碱基字母
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(12);
            text(fixedBase.type, fixedBase.x, fixedBase.y);
        }
    }

    // 新增：绘制下链碱基配对连接(虚线)
    drawBottomPairConnections(startX, currentSpacing) {
        if (this.bottomPairConnections.length === 0) return;
        
        push();
        stroke(0);
        strokeWeight(1);
        
        for (let connection of this.bottomPairConnections) {
            const x = startX + connection.index * this.baseSpacing;
            const bottomY = currentSpacing/2 - 11.25 - this.baseHeight/2;
            const topY = connection.fixedY + this.baseHeight/2;
            
            // 设置虚线样式
            drawingContext.setLineDash([5, 3]);
            
            // 根据碱基对类型绘制不同数量的虚线
            const numLines = connection.isAT ? 2 : 3;
            const lineSpacing = 8;
            
            for (let i = 0; i < numLines; i++) {
                const offset = (i - (numLines-1)/2) * lineSpacing;
                line(x + offset, bottomY, x + offset, topY);
            }
        }
        
        // 恢复实线样式
        drawingContext.setLineDash([]);
        pop();
    }

    // 修改：绘制完成的下链矩形
    drawCompletedBottomChainRect(startX, totalWidth, currentSpacing) {
        const rectY = currentSpacing/2 - 70; // 矩形在下链上方0.7cm处
        
        push();
        fill(this.midRectColor);
        noStroke();
        // 绘制从DNA左端到右端的完整矩形，向左偏移1cm(30像素)
        rect(startX - 20, rectY - this.midRectWidth/2, totalWidth, this.midRectWidth);
        pop();
    }

    // 新增：更新下链聚合酶位置和进度
    updateBottomChainPolymerase() {
        // 计算DNA链的总宽度和起始位置
        const totalWidth = this.sequence.length * this.baseSpacing;
        const startX = -totalWidth/2;
        const endX = startX + totalWidth;
        const currentSpacing = this.chainSpacing * (1 + this.maxChainSpacingIncrease * (this.chainSpacingProgress / 100));
        
        // 计算进度百分比
        this.bottomChainPolymeraseProgress = (this.fixedBottomBases.length / this.sequence.length) * 100;
        
        // 计算聚合酶在下链上的位置，从左到右移动1cm(100像素)
        const moveDistance = 350; // 1cm 等于 100 像素
        const polymeraseXOffset = (this.bottomChainPolymeraseProgress / 100) * moveDistance;
        
        // 更新聚合酶位置
        this.polymeraseX = startX + polymeraseXOffset;
        this.polymeraseY = currentSpacing/2 - 50; // 下链上方
        
        console.log("更新下链聚合酶 - 进度:", this.bottomChainPolymeraseProgress.toFixed(2), 
                    "%, 位置:", this.polymeraseX, this.polymeraseY);
    }

    // 新增：绘制部分下链矩形
    drawPartialBottomChainRect(startX, totalWidth, currentSpacing) {
        if (this.fixedBottomBases.length === 0) return;
        
        const rectY = currentSpacing/2 - 70; // 矩形在下链上方0.7cm处
        
        // 计算矩形宽度，基于已配对的碱基数量
        const rectWidth = totalWidth * (this.bottomChainPolymeraseProgress / 100);
        
        push();
        fill(this.midRectColor);
        noStroke();
        // 从左向右绘制矩形，向左偏移1cm(100像素)
        rect(startX - 20, rectY - this.midRectWidth/2, rectWidth, this.midRectWidth);
        pop();
    }

    // 添加绘制版权信息的方法
    drawCopyright() {
        push();
        fill(0); // 黑色文字
        textAlign(RIGHT, BOTTOM);
        textSize(14);
        // 右下角位置
        text("@华政附高 版权所有", width/2 - 10, height/2 - 10);
        pop();
    }
} 