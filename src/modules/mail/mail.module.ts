import { Global, Module } from '@nestjs/common';
import { MailService } from './services/mail.service';

@Global()
@Module({
    providers: [MailService],
    exports: [MailService],
})
export class EmailModule { }