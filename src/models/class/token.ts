/**
 * token类
 */
export class Token {
    tokenName: string;           // token名称
    tokenValue: string;      // token值
    loginId: string | number;               // 此token对应的LoginId，未登录时为null
    tokenTime: number;          // token创建时间
    tokenTimeout: number;          // token剩余有效期 (单位: 秒)

    constructor(tokenName: string, tokenValue: string, loginId: string | number, tokenTimeout: number) {
        this.tokenName = tokenName;
        this.tokenValue = tokenValue;
        this.loginId = loginId;
        this.tokenTime = new Date().getTime();
        this.tokenTimeout = tokenTimeout;
    }
}
