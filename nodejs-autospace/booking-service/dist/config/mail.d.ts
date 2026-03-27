import nodemailer from "nodemailer";
export declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
export declare const sendMail: (to: string, subject: string, text: string) => Promise<void>;
//# sourceMappingURL=mail.d.ts.map