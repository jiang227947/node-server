import nodemailer from 'nodemailer';
import {MailInterface} from '../interface/mail';

/**
 * 邮件发送服务
 */
export default class MailService {
    // 服务实例
    private static instance: MailService;
    // 发送邮件实例
    private transporter: nodemailer.Transporter | undefined;

    constructor() {
    }

    // 为邮件创建实例
    static getInstance(): MailService {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    // 创建一个连接
    async createConnection(): Promise<void> {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            }
        });
    }

    // 发送邮件
    async sendMail(requestId: string, options: MailInterface) {
        const transporter = this.transporter as nodemailer.Transporter;
        return await transporter.sendMail({
            from: `"EVZIYI" ${process.env.SMTP_SENDER || options.from}`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        }).then((info) => {
            return info;
        });
    }

    // 返回transporter
    getTransporter(): nodemailer.Transporter | undefined {
        return this.transporter;
    }
}

/**
 * 返回邮件内容结构
 * @param code 6位数验证码
 */
export const verifyEmail = (code: string) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8">
          <meta name="x-apple-disable-message-reformatting">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
          <title>Reset your Password</title>
          <link
            href="https://fonts.googleapis.com/css?family=Montserrat:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700"
            rel="stylesheet" media="screen">
          <style>
            .hover-underline:hover {
              text-decoration: underline !important;
            }
    
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
    
            @keyframes ping {
    
              75%,
              100% {
                transform: scale(2);
                opacity: 0;
              }
            }
    
            @keyframes pulse {
              50% {
                opacity: .5;
              }
            }
    
            @keyframes bounce {
    
              0%,
              100% {
                transform: translateY(-25%);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
              }
    
              50% {
                transform: none;
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
              }
            }
    
            @media (max-width: 600px) {
              .sm-px-24 {
                padding-left: 24px !important;
                padding-right: 24px !important;
              }
    
              .sm-py-32 {
                padding-top: 32px !important;
                padding-bottom: 32px !important;
              }
    
              .sm-w-full {
                width: 100% !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; --bg-opacity: 1; background-color: #eceff1;">
          <div role="article" aria-roledescription="email" aria-label="Reset your Password" lang="en">
            <table style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; width: 100%;" width="100%"
              cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center"
                  style="--bg-opacity: 1; background-color: #eceff1; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;">
                  <table class="sm-w-full" style="font-family: 'Montserrat',Arial,sans-serif; width: 600px;" width="600"
                    cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="sm-py-32 sm-px-24"
                        style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; padding: 48px; text-align: center;"
                        align="center">
                        <a href=""
                            style="border: 0; max-width: 100%; line-height: 100%; vertical-align: middle;">
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" class="sm-px-24" style="font-family: 'Montserrat',Arial,sans-serif;">
                        <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;" width="100%" cellpadding="0"
                          cellspacing="0" role="presentation">
                          <tr>
                            <td class="sm-px-24"
                              style="--bg-opacity: 1; background-color: #ffffff;  border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; line-height: 24px; padding: 48px; text-align: left; --text-opacity: 1; color: #626262;"
                               align="left">
                              <p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hello 你好：</p>
    
                              <p style="margin: 0 0 24px;">
                              感谢你注册我的网站，请回填如下6位验证码：
                              </p>
                              <lable style="display: block; font-size: 24px; line-height: 100%; margin-bottom: 24px; --text-opacity: 1; color: #000000; text-decoration: none;">${code}</lable>
                              <p style="margin: 0 0 24px;">
                              Thank you for registering my website, please fill in the following 6-digit verification code:
                              </p>
    
                              <lable style="display: block; font-size: 24px; line-height: 100%; margin-bottom: 24px; --text-opacity: 1; color: #000000; text-decoration: none;">${code}</lable>
                              <table style="font-family: 'Montserrat',Arial,sans-serif;" cellpadding="0" cellspacing="0"
                                role="presentation">
                                <tr>
                                  <td
                                    style="mso-padding-alt: 16px 24px; --bg-opacity: 1; background-color: #7367f0;  border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;">
                                    
                                  </td>
                                </tr>
                              </table>
    
                              <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;" width="100%"
                                cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td
                                    style="font-family: 'Montserrat',Arial,sans-serif; padding-top: 32px; padding-bottom: 32px;">
                                    <div
                                      style="--bg-opacity: 1; background-color: #eceff1; height: 1px; line-height: 1px;">
                                      &zwnj;</div>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin: 0 0 16px;">感谢你的支持 Thanks</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-family: 'Montserrat',Arial,sans-serif; height: 20px;" height="20"></td>
                          </tr>
                          <tr>
                            <td style="font-family: 'Montserrat',Arial,sans-serif; height: 16px;" height="16"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </body>
    </html>`;
    const text = `Verify Email`;
    return {
        html: html,
        text: text,
    };
};
