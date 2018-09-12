import { Mutation, Query, Resolver} from "@nestjs/graphql";
import { PagerService } from "../../export/common.paging";
import { CqrsService } from "../../cqrsCms/cqrs.service";
import { ClassifyService } from "../../cqrsCms/service/classify.service";
import { ArticleEntity } from "../../entity/article.entity";
import { ArticleCurdVm } from "../../cqrsCms/models/view/article-curd.vm";
const articleVM: ArticleCurdVm = new ArticleCurdVm();
let result;
let paging;
@Resolver()
export class ArticleResolver {
    constructor(
        private readonly classifyService: ClassifyService,
        private readonly sitemapService: CqrsService,
        private readonly pagerService: PagerService) {
    }

    /**
     * 新增文章
     * @param obj
     * @param {{art: ArticleEntity}} body
     * @returns {Promise<string>}
     */
    @Mutation("createArt")
    async createArt(obj, body: {art: ArticleEntity }) {
        const art: ArticleEntity = body.art;
        const ws = new Map();
        ws.set("obj", obj);
        if (art.publishedTime) {
            const date: string = art.publishedTime.toString();
            art.publishedTime = new Date(Date.parse(date.replace(/- /g, "/")));
        } else {
            art.publishedTime = undefined;
        }
        if (art.endTime) {
            const endTime: string = art.endTime.toString();
            art.endTime = new Date(Date.parse(endTime.replace(/- /g, "/")));
        }
        if (art.startTime) {
            const startTime: string = art.startTime.toString();
            art.startTime = new Date(Date.parse(startTime.replace(/- /g, "/")));
        }
        articleVM.createArticle = { article: art, url: ws };
        result = await this.sitemapService.articleCurd(articleVM);
        return JSON.stringify(result);
    }

    /**
     * 修改文章
     * @param obj
     * @param {{art: ArticleEntity}} body
     * @returns {Promise<string>}
     */
    @Mutation("updateArt")
    async updateArt(obj, body: {art: ArticleEntity}) {
        const art: ArticleEntity = body.art;
        if (art.publishedTime) {
            const date: string = art.publishedTime.toString();
            art.publishedTime = new Date(Date.parse(date.replace(/- /g, "/")));
        }
        if (art.startTime) {
            const startTime: string = art.startTime.toString();
            art.startTime = new Date(Date.parse(startTime.replace(/- /g, "/")));
        }
        if (art.endTime) {
            const endTime: string = art.endTime.toString();
            art.endTime = new Date(Date.parse(endTime.replace(/- /g, "/")));
        }
        const newArticle: ArticleEntity = art;
        const ws = new Map();
        ws.set("obj", obj);
        articleVM.updateArticle = { article: newArticle, url: ws };
        result = await this.sitemapService.articleCurd(articleVM);
        return JSON.stringify(result);
    }

    /**
     * 批量删除文章到回收站
     * @param obj
     * @param {{ids: Array<number>}} body
     * @returns {Promise<string>}
     */
    @Mutation("deleteByIds")
    async deleteByIds(obj, body: {ids: Array<number>}) {
        articleVM.deleteById = body.ids;
        result = await this.sitemapService.articleCurd(articleVM);
        return JSON.stringify(result);
    }

    /**
     * 回收站内删除文章
     * @param obj
     * @param {{ids: Array<number>}} body
     * @returns {Promise<string>}
     */
    @Mutation("recycleDelete")
    async recycleDelete(obj, body: {ids: Array<number>}) {
        articleVM.recycleDelete = body.ids;
        result = await this.sitemapService.articleCurd(articleVM);
        return JSON.stringify(result);
    }

    /**
     * 回收站内还原文章
     * @param obj
     * @param {{ids: Array<number>}} body
     * @returns {Promise<string>}
     */
    @Mutation("reductionArticle")
    async reductionArticle(obj, body: {ids: Array<number>}) {
        articleVM.reductionArticle = body.ids;
        result = await this.sitemapService.articleCurd(articleVM);
        return JSON.stringify(result);
    }

    /**
     * 批量反向置顶
     * @param obj
     * @param {{id: number; display: Array<number>}} body
     * @returns {Promise<string>}
     */
    @Mutation("classifyTopPlace")
    async classifyTopPlace(obj, body: { id: number, display: Array<number>}) {
        const num = await this.classifyService.classifyTopPlace(body.id, body.display);
        result = `成功将${num}条数据置顶`;
        return result;
    }

    /**
     * 获取所有文章
     * @param obj
     * @param {{limitNum: number; pages: number; hidden: boolean}} body
     * @returns {Promise<any>}
     */
    @Query("getArticleAll")
    async getArticleAll(obj, body: {limitNum: number, pages: number, hidden: boolean}){
        articleVM.getArticles = { getArticleAll: true, hidden: body.hidden };
        articleVM.limitNum = body.limitNum;
        articleVM.pages = body.pages;
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        paging = this.pagerService.getPager(result.totalItems, articleVM.pages, articleVM.limitNum);
        return { pagination: paging, articles: result.articles };
    }

    /**
     * 获取所有回收站内文章
     * @param obj
     * @param {{limitNum: number; pages: number}} body
     * @returns {Promise<any>}
     */
    @Query("recycleFind")
    async recycleFind(obj, body: {limitNum: number, pages: number}){
        articleVM.getArticles = { recycleFind: true };
        articleVM.limitNum = body.limitNum;
        articleVM.pages = body.pages;
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        paging = this.pagerService.getPager(result.totalItems, articleVM.pages, articleVM.limitNum);
        return { pagination: paging, articles: result.articles };
    }

    /**
     * 回收站内根据分类id搜索
     * @param obj
     * @param {{limitNum: number; pages: number; id: number; show: boolean}} body
     * @returns {Promise<any>}
     */
    @Query("reductionGetByClassifyId")
    async reductionGetByClassifyId(obj, body: { id: number, limitNum: number, pages: number}) {
        articleVM.getArticles = { reductionGetByClassifyId: body.id };
        articleVM.limitNum = body.limitNum;
        articleVM.pages = body.pages;
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        paging = this.pagerService.getPager(result.totalItems, articleVM.pages, articleVM.limitNum);
        return { pagination: paging, articles: result.articles };
    }

    /**
     * 获取所有全局文章
     * @param obj
     * @param {{limitNum: number; pages: number}} body
     * @returns {Promise<any>}
     */
    @Query("findTopPlace")
    async findTopPlace(obj, body: {limitNum: number, pages: number}){
        articleVM.getArticles = { findTopPlace: true };
        articleVM.limitNum = body.limitNum;
        articleVM.pages = body.pages;
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        paging = this.pagerService.getPager(result.totalItems, articleVM.pages, articleVM.limitNum);
        return { pagination: paging, articles: result.articles };
    }

    /**
     * 关键字搜索
     * @param obj
     * @param {{limitNum: number; pages: number; keyWords: string; classifyId: number; topPlace: boolean}} body
     * @returns {Promise<any>}
     */
    @Query("searchArticle")
    async searchArticle(obj, body: {limitNum: number, pages: number, keyWords: string, classifyId: number, topPlace: boolean}){
        articleVM.getArticles = { getArticleByClassifyId: { classifyId: body.classifyId, top: body.topPlace, name: body.keyWords }, getArticleAll: false };
        articleVM.limitNum = body.limitNum;
        articleVM.pages = body.pages;
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        paging = this.pagerService.getPager(result.totalItems, articleVM.pages, articleVM.limitNum);
        return { pagination: paging, articles: result.articles };
    }

    /**
     * 此处用于搜索 资讯和活动下分类的 文章
     * @param obj
     * @param {{limitNum: number; pages: number; keyWords: string}} body
     * @returns {Promise<{pagination: any; articles}>}
     */
    @Query("keywordSearch")
    async keywordSearch(obj, body: {limitNum: number, pages: number, keyWords: string}){
        articleVM.getArticles = { keywordSearch: { keywords: body.keyWords } };
        articleVM.limitNum = body.limitNum;
        articleVM.pages = body.pages;
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        paging = this.pagerService.getPager(result.totalItems, articleVM.pages, articleVM.limitNum);
        return { pagination: paging, articles: result.articles };
    }

    /**
     * 获取文章详情，此处会返回 上一篇文章 和下一篇 文章
     * @param obj
     * @param {{id: number}} body
     * @returns {Promise<any>}
     */
    @Query("getArticleById")
    async getArticleById(obj, body: {id: number}){
        articleVM.getArticles = { getArticleById: body.id };
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        console.log("result");
        console.log(result.articles.length);
        return result.articles;
    }

    /**
     * 显示子级分类文章
     * @param obj
     * @param {{id: number}} body
     * @returns {Promise<any>}
     */
    @Query("showNext")
    async showNext(obj, body: {id: number }) {
        articleVM.getArticles = { showNext: body.id };
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        return result;
    }

    /**
     * 显示上级分类置顶文章
     * @param obj
     * @param {{id: number}} body
     * @returns {Promise<any>}
     */
    @Query("superiorArticle")
    async superiorArticle(obj, body: {id: number }) {
        articleVM.getArticles = { superiorArticle: body.id };
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        return result;
    }

    /**
     * 获取当前分类下的所有文章
     * @param obj
     * @param {{id: number}} body
     * @returns {Promise<any>}
     */
    @Query("getCurrentClassifyArticles")
    async getCurrentClassifyArticles(obj, body: {id: number }) {
        articleVM.getArticles = { getCurrentClassifyArticles: body.id };
        articleVM.getAllArticles = true;
        result = await this.sitemapService.articleCurd(articleVM);
        return result;
    }

}