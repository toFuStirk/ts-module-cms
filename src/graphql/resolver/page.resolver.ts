import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { PagerService } from "../../export/common.paging";
import { CqrsService } from "../../cqrsCms/cqrs.service";
import { ClassifyService } from "../../cqrsCms/service/classify.service";
import { PageEntity } from "../../entity/page.entity";
import { PageContentEntity } from "../../entity/page.content.entity";
import { CreatePageVm } from "../../cqrsCms/models/view/create-page.vm";
import { GetPageVm } from "../../cqrsCms/models/view/get-page.vm";
const createParam: CreatePageVm = new CreatePageVm();
const pageParam: GetPageVm = new GetPageVm();
let result;
@Resolver("page")
export class PageResolver{
    constructor(
        private readonly classifyService: ClassifyService,
        private readonly sitemapService: CqrsService,
        private readonly pagerService: PagerService) {
    }

    /**
     * 新增页面
     * @param obj
     * @param {{page: PageEntity; contents: Array<string>}} body
     * @returns {Promise<string>}
     */
    @Mutation("createPages")
    async createPages(obj, body: {page: PageEntity, contents: Array<string>}){
        const contents: Array<PageContentEntity> = [];
        const strFinal: Array<string> = body.contents;
        for (const t in strFinal) {
            const newContent: PageContentEntity = new PageContentEntity();
            newContent.content = strFinal[ t ];
            contents.push(newContent);
        }
        createParam.page = body.page;
        createParam.content = contents;
        result = await this.sitemapService.pageCurd(createParam);
        return JSON.stringify(result);
    }

    /**
     * 修改页面
     * @param obj
     * @param {{page: PageEntity}} body
     * @returns {Promise<string>}
     */
    @Mutation("updatePages")
    async updatePages(obj, body: {page: PageEntity}) {
        createParam.page = body.page;
        createParam.content = body.page.contents;
        result = await this.sitemapService.pageCurd(createParam);
        return JSON.stringify(result);
    }

    /**
     * 删除页面
     * @param obj
     * @param {{ids: Array<number>}} body
     * @returns {Promise<string>}
     */
    @Mutation("deletePages")
    async deletePages(obj, body: {ids: Array<number>}){
        createParam.array = body.ids;
        result = await this.sitemapService.pageCurd(createParam);
        return JSON.stringify(result);
    }

    /**
     * 获取所有页面
     * @param obj
     * @param {{limitNum: number; pages: number; keywords: string}} body
     * @returns {Promise<{pagination: {totalItems: number; currentPage: number | undefined; pageSize: number | undefined; totalPages: number; startPage: number; endPage: number; startIndex: number; endIndex: number; pages: number[]}; pages}>}
     */
    @Query("getAllPage")
    async getAllPage(obj, body: {limitNum: number, pages: number, keywords: string}) {
        pageParam.getAll = true;
        pageParam.limit = body.limitNum;
        pageParam.pages = body.pages;
        pageParam.keywords = body.keywords;
        const resultPage = await this.sitemapService.getPages(pageParam);
        const paging = this.pagerService.getPager(resultPage.totalItems, pageParam.pages, pageParam.limit);
        return { pagination: paging, pages: resultPage.pages };
    }

    /**
     * 获取指定分类下的所有页面
     * @param obj
     * @param {{id: number; limitNum: number; pages: number}} body
     * @returns {Promise<{pagination: {totalItems: number; currentPage: number | undefined; pageSize: number | undefined; totalPages: number; startPage: number; endPage: number; startIndex: number; endIndex: number; pages: number[]}; pages}>}
     */
    @Query("getPagesByClassifyId")
    async getPagesByClassifyId(obj, body: {id: number, limitNum: number, pages: number }){
        pageParam.classifyId = body.id;
        pageParam.limit = body.limitNum;
        pageParam.pages = body.pages;
        const resultPage = await this.sitemapService.getPages(pageParam);
        const paging = this.pagerService.getPager(resultPage.totalItems, pageParam.pages, pageParam.limit);
        return { pagination: paging, pages: resultPage.pages };
    }

    /**
     * 获取页面详情
     * @param obj
     * @param {{id: number}} body
     * @returns {Promise<any>}
     */
    @Query("getPageById")
    async getPageById(obj, body: {id: number}){
        pageParam.id = body.id;
        result = await this.sitemapService.getPages(pageParam);
        return result;
    }
}