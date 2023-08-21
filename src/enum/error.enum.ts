/**
 * 登录凭证校验错误枚举
 */
export enum WxErrCodeEnum {
    // 成功
    success = 0,
    // js_code无效
    error1 = 40029,
    // API 调用太频繁，请稍候再试
    error2 = 45011,
    // 高风险等级用户，小程序登录拦截 。风险等级详见用户安全解方案
    error3 = 40226,
    // 系统繁忙，此时请开发者稍候再试
    error4 = -1
}
