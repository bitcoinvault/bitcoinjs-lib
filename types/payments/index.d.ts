import { Network } from '../networks';
import { p2data as embed } from './embed';
import { p2air } from './p2air';
import { p2ar } from './p2ar';
import { p2ms } from './p2ms';
import { p2pk } from './p2pk';
import { p2pkh } from './p2pkh';
import { p2sh } from './p2sh';
import { p2wpkh } from './p2wpkh';
import { p2wsh } from './p2wsh';
export declare enum VaultTxType {
    Alert = 0,
    Instant = 1,
    Recovery = 2,
    NonVault = 3
}
export interface Payment {
    name?: string;
    network?: Network;
    output?: Buffer;
    data?: Buffer[];
    m?: number;
    n?: number;
    pubkeys?: Buffer[];
    input?: Buffer;
    signatures?: Buffer[];
    pubkey?: Buffer;
    signature?: Buffer;
    address?: string;
    hash?: Buffer;
    redeem?: Payment;
    witness?: Buffer[];
    vaultTxType?: number;
}
export declare type PaymentCreator = (a: Payment, opts?: PaymentOpts) => Payment;
export declare type PaymentFunction = () => Payment;
export interface PaymentOpts {
    validate?: boolean;
    allowIncomplete?: boolean;
}
export declare type StackElement = Buffer | number;
export declare type Stack = StackElement[];
export declare type StackFunction = () => Stack;
export { embed, p2air, p2ar, p2ms, p2pk, p2pkh, p2sh, p2wpkh, p2wsh };
