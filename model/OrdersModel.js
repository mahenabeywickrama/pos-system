export default class OrdersModel {
    constructor(id, cusId, totalPrice, date) {
        this.id = id;
        this.cusId = cusId;
        this.totalPrice = totalPrice;
        this.date = date;
    }
}