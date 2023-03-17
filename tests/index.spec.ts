import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";
import { jest } from "@jest/globals";

const voucher = {
    code: 'AA1234',
    discount: 10
}

describe("voucher service test suite", () => {
    it("should not create voucher if code already exist", async () => {
        jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => {
            return {
                id: 1,
                code: voucher.code,
                discount: voucher.discount,
                used: false
            }
        });
       
        const promise = voucherService.createVoucher(voucher.code, voucher.discount);
        expect(promise).rejects.toEqual({
            message: "Voucher already exist.",
            type: "conflict"
        });
    });

    it("should create a new voucher", async () => {
        jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => {});
        jest.spyOn(voucherRepository, 'createVoucher').mockImplementationOnce((): any => {
            return {
                code: voucher.code,
                discount: voucher.discount
            }
        });
        
        const promise = voucherService.createVoucher(voucher.code, voucher.discount);
        expect(promise).resolves.toEqual({
            code: voucher.code,
            discount: voucher.discount
        });
    });

    it("should not apply invalid voucher", async () => {
        const value = 150;
        jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => {
            return undefined;
        });
        const promise = voucherService.applyVoucher(voucher.code, value);
        expect(promise).rejects.toEqual({
            message: "Voucher does not exist.",
            type: "conflict"
        });
    });

    it("should not apply voucher if the amount is less than 100", async () => {
       const value = 99;
       jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => {
        return {
            id: 1,
            code: voucher.code,
            discount: voucher.discount,
            used: false
        }
       });

       const result = await voucherService.applyVoucher(voucher.code, value);
       expect(result).toEqual({
        amount: value,
        discount: voucher.discount,
        finalAmount: value,
        applied: false
       });
    });

    it("should not apply voucher if voucher is already used", async () => {
        const value = 150;
        jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => {
            return {
                id: 1,
                code: voucher.code,
                discount: voucher.discount,
                used: true
            }
        });

        const result = await voucherService.applyVoucher(voucher.code, value);
        expect(result).toEqual({
        amount: value,
        discount: voucher.discount,
        finalAmount: value,
        applied: false
        });
    });

    it("should applied voucher", async () => {
        const value = 200;
        jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementationOnce((): any => {
            return {
                id: 1,
                code: voucher.code,
                discount: voucher.discount,
                used: false
            }
        });
        jest.spyOn(voucherRepository, 'useVoucher').mockImplementationOnce((): any => {});

        const result = await voucherService.applyVoucher(voucher.code, value);
        expect(result).toEqual({
            amount: value,
            discount: voucher.discount,
            finalAmount: value - (value * (voucher.discount / 100)),
            applied: true
        });
    });
});