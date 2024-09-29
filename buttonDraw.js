class Button {
    constructor(buttonElement) {
        this.id = buttonElement.id;
        this.enter = buttonElement.enter;
        this.profit = buttonElement.profit;
        this.stop = buttonElement.stop;
        this.opened = buttonElement.opened;
        this.x = buttonElement.x;
        this.y = buttonElement.y;
        this.width = buttonElement.width;
        this.height = buttonElement.height;
        this.profitColor = buttonElement.profitColor;
        this.stopColor = buttonElement.stopColor;
        this.textColor = buttonElement.textColor;
    }

    getInsideOrder(x, y) {
        let orderButtonX1, orderButtonY1, orderButtonX2, orderButtonY2;
        orderButtonX1 = this.x;
        orderButtonY1 = this.y;
        orderButtonX2 = this.x + this.width / 2;
        orderButtonY2 = this.y + this.height;

        return x > orderButtonX1 && x < orderButtonX2 && y > orderButtonY1 && y < orderButtonY2;
    }

    getInsideCancel(x, y) {
        let cancelButtonX1, cancelButtonY1, cancelButtonX2, cancelButtonY2;
        cancelButtonX1 = this.x + this.width / 2;
        cancelButtonY1 = this.y;
        cancelButtonX2 = this.x + this.width;
        cancelButtonY2 = this.y + this.height;

        return x > cancelButtonX1 && x < cancelButtonX2 && y > cancelButtonY1 && y < cancelButtonY2;
    }

    getCursorType(x, y) {
        if (this.getInsideOrder(x, y)) {
            return this.opened ? 'not-allowed' : 'pointer';
        } else if (this.getInsideCancel(x, y)) {
            return this.opened ? 'pointer' : 'not-allowed';
        } else {
            return null;
        }
    }
}