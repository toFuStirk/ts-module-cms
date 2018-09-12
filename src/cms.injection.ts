import { Module } from "@nestjs/common";
import { CqrsModule } from "./cqrsCms/cqrs.module";
import { RegistrationModule } from "./enter/registration.module";
import { UpyunModule } from "@notadd/addon-upyun";
@Module({
    imports: [
        CqrsModule,
        UpyunModule,
        RegistrationModule,
    ],
})
export class CmsModule {
}
