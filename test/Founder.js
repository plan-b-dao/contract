const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function() {
    it("It should return the tkoen balance", async () => {
        const [owner] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Founder")
        const FounderContract = await Token.deploy();
        const balance = await FounderContract.balance();
        expect(balance).to.equal(0);
    })

    it("It should return the withdraw rate", async () => {
        const [owner] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Founder");
        const FounderContract = await Token.deploy();
        const rate = await FounderContract.rate();
        expect(Number(rate)).to.equal(1000000000000000000);
    })

    it("It should return the limit", async () => {
        const [owner] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Founder");
        const FounderContract = await Token.deploy();
        const limit = await FounderContract.limit();
        expect(limit).to.equal(1000);
    })

    it("It should make user a founder", async () => {
        const [owner, user] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Founder");
        const FounderContract = await Token.deploy();

        const ethAmount = "1";
        const weiAmount = ethers.utils.parseEther(ethAmount);
        const transaction = {
            value: weiAmount,
        }

        await FounderContract.becomeFounder(user.address, transaction);
        const isFounder = await FounderContract.isFounder(user.address);
        expect(isFounder).to.equal(true);
    })

    it("It should withdraw user funds and remove him from founders list", async () => {
        const [owner, user] = await ethers.getSigners();
        let userBalance = await user.getBalance(); //10000 eth
        userBalance = Number(ethers.utils.formatEther(userBalance));
        const Token = await ethers.getContractFactory("Founder");
        const FounderContract = await Token.deploy();
        const UserFounderContract = await FounderContract.connect(user);
        const ethAmount = "1";
        const weiAmount = ethers.utils.parseEther(ethAmount);
        const transaction = {
            value: weiAmount,
        }
        await UserFounderContract.becomeFounder(user.address, transaction);
        userBalance -= 1;
        const balance = await user.getBalance();
        expect(Number(ethers.utils.formatEther(await user.getBalance()))).lt(userBalance);
        expect(Number(ethers.utils.formatEther(await FounderContract.balance()))).to.eq(1);
        const isFounder = await FounderContract.isFounder(user.address);
        expect(isFounder).to.equal(true)
        await UserFounderContract.withdraw();
        const isFounderAfterWithdraw = await FounderContract.isFounder(user.address);
        expect(isFounderAfterWithdraw).to.equal(false);
        expect(Number(ethers.utils.formatEther(await user.getBalance()))).gt(userBalance);
        expect(Number(ethers.utils.formatEther(await FounderContract.balance()))).to.eq(0);
    })

    it("It should set limit and return the value", async () => {
        const [owner] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Founder");
        const FounderContract = await Token.deploy();
        const limit = await FounderContract.limit();
        expect(limit).to.equal(1000);
        await FounderContract.setLimit(100);
        expect(await FounderContract.limit()).to.eq(100);
    })
});