export default class OrdersModel {
    constructor(id, cusId, customerName, discountPer, discountAmount, totalPrice, cash, balance, date) {
        this.id = id;
        this.cusId = cusId;
        this.customerName = customerName;
        this.discountPer = discountPer;
        this.discountAmount = discountAmount;
        this.totalPrice = totalPrice;
        this.cash = cash;
        this.balance = balance;
        this.date = date;
    }
}