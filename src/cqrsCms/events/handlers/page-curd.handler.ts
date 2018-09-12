import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PageService } from "../../service/page.service";
import { PageCurdEvent } from "../impl/page-curd.event";

@EventsHandler(PageCurdEvent)
export class PageCurdHandle implements IEventHandler<PageCurdEvent> {
    constructor(readonly pageService: PageService) {
    }

    async handle(event: PageCurdEvent): Promise<any> {
        const array: Array<number> = event.pageEntity.array;
        /*新增页面*/
        if (event.pageEntity.page && event.pageEntity.page.id === undefined) {
            this.pageService.createPages(event.pageEntity.page, event.pageEntity.content);
        }
        /*修改页面*/
        if (event.pageEntity.page && event.pageEntity.page.id >= 1) {
            this.pageService.updatePages(event.pageEntity.page, event.pageEntity.content);
        }
        /*删除页面*/
        if (!event.pageEntity.page && array.length >= 1) {
            this.pageService.deletePages(array);
        }
    }
}
