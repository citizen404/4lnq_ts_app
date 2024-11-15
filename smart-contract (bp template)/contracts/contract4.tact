import "@stdlib/deploy";

message Withdraw {
    amount: Int as coins;
}

contract Contract4 with Deployable {

    const MinTonForStorage: Int = ton("0.01");
    deployer: Address;
    const lnkTon: Address = address("kQD5ePrZgy28JOd-csrEZ4qIC6AQ-pF-jyeIMXHRYVWTqCuE"); //Address of platform ton wallet
    val: Int as int64;

    init() {
        self.deployer = sender();
        self.val = 0;
    }

    receive() {
        dump("empty message received");
    }

    receive("increment") {
        dump(context().value);
        self.val = self.val + 1;
    }

    receive("refund increment") {
        dump(context().value);
        self.val = self.val + 1;
        self.reply("increment refund".asComment());
    }

    receive(msg: Withdraw) {
        require(sender() == self.deployer, "only the deployer is allowed to withdraw");
        let amount: Int = min(msg.amount, myBalance() - context().value - self.MinTonForStorage);
        require(amount > 0, "insufficient balance");
        send(
            SendParameters{
                to: self.lnkTon,
                bounce: true,
                value: amount,
                mode: SendRemainingValue + SendIgnoreErrors
            }
        );
    }

    //get fun balance(): String {
    //    return myBalance().toCoinsString();
    //}

    get fun balance(): Int {
        return myBalance();
    }

    get fun val(): Int {
        return self.val;
    }
}