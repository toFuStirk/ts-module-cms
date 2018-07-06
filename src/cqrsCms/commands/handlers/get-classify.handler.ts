import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassifyService } from "../../service/classify.service";
import { GetClassifyParamCommand } from "../impl/get-classify-param.command";

@CommandHandler(GetClassifyParamCommand)
export class GetClassifyHandler implements ICommandHandler<GetClassifyParamCommand> {
    constructor(private readonly classifyService: ClassifyService) {
    }

    async execute(command: GetClassifyParamCommand, resolver: (value) => void) {
        let result;
        /*页面分类无极限*/
        if (command.getClassify.useFor === "page") {
            result = await this.classifyService.findAllClassifyPage(command.getClassify.id);
        }
        /*文章分类无极限*/
        if (command.getClassify.useFor === "art") {
            result = await this.classifyService.findAllClassifyArt(command.getClassify.id);
        }
        if (command.getClassify.getClassifyById) {
            result = await this.classifyService
                .findClassifyById(
                    command.getClassify.getClassifyById.useFor,
                    command.getClassify.getClassifyById.id,
                );
        }
        resolver(result);
    }
}
