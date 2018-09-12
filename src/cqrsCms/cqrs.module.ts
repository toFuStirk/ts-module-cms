import { Module, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { CommandBus, CQRSModule, EventBus } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "../entity/article.entity";
import { ClassifyEntity } from "../entity/classify.entity";
import { PageContentEntity } from "../entity/page.content.entity";
import { PageEntity } from "../entity/page.entity";
import { PageClassifyEntity } from "../entity/pageClassify.entity";
import { PagerService } from "../export/common.paging";
import { SiteMapModule } from "../sitemap/sitemap.module";
import { CommandHandlers } from "./commands/handlers";
import { CqrsService } from "./cqrs.service";
import { EventHandlers } from "./events/handlers";
import { PageRepository } from "./repository/pageRepository";
import { PageSagas } from "./sagas/page.sagas";
import { ArticleService } from "./service/article.service";
import { ClassifyService } from "./service/classify.service";
import { PageService } from "./service/page.service";
import { ArticleResolver } from "../graphql/resolver/article.resolver";
import { PageResolver } from "../graphql/resolver/page.resolver";
import { ClassifyResolver } from "../graphql/resolver/classify.resolver";

@Module({
    imports: [
        CQRSModule,
        SiteMapModule,
        TypeOrmModule.forFeature([
            ArticleEntity,
            ClassifyEntity,
            PageEntity,
            PageClassifyEntity,
            PageContentEntity,
        ]),
    ],
    providers: [
        ArticleService,
        ClassifyService,
        PageService,
        ArticleResolver,
        PageResolver,
        ClassifyResolver,
        CqrsService,
        PageRepository,
        ...CommandHandlers,
        ...EventHandlers,
        PageSagas,
        PagerService,
    ],
})
export class CqrsModule implements OnModuleInit {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly command$: CommandBus,
        private readonly event$: EventBus,
        // private readonly PageSagas: PageSagas,
    ) {
    }

    onModuleInit() {
        this.command$.setModuleRef(this.moduleRef);
        this.event$.setModuleRef(this.moduleRef);

        this.event$.register(EventHandlers);
        this.command$.register(CommandHandlers);
        // this.event$.combineSagas([this.PageSagas.articleXml,this.PageSagas.pageXml/*,this.PageSagas.getPages,this.PageSagas.getArticles,this.PageSagas.getClassification*/]);
    }
}
