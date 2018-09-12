import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { CqrsService } from "../../cqrsCms/cqrs.service";
import { ClassifyService } from "../../cqrsCms/service/classify.service";
import { ClassifyEntity } from "../../entity/classify.entity";
import { ClassifyCurdVm } from "../../cqrsCms/models/view/classify-curd.vm";
import {ClassifyInterface} from "../../cqrsCms/common/classify.interface";
let result;
const classifyVM: ClassifyCurdVm = new ClassifyCurdVm();
@Resolver("classify")
export class ClassifyResolver {
    constructor(
        private readonly classifyService: ClassifyService,
        private readonly sitemapService: CqrsService,
    ){}

    /**
     * 获取所有分类,或者指定分类
     * @param obj
     * @param {{useFor: string; id: number}} body
     * @returns {any}
     */
    @Query("getClassifys")
    async getClassifys(obj, body: { useFor: string, id: number }) {
        classifyVM.useFor = body.useFor;
        classifyVM.getAllClassify = true;
        classifyVM.id = body.id;
        result = this.sitemapService.getClassify(classifyVM);
        return result;
    }

    /**
     * 获取分类详情
     * @param obj
     * @param {{useFor: string; id: number}} body
     * @returns {Promise<any>}
     */
    @Query("getClassifyById")
    async getClassifyById(obj, body: { useFor: string, id: number }) {
        const usedFor: string = body.useFor;
        let idNum: number = body.id;
        if (idNum === null && idNum === 0) {
            idNum = 1;
        }
        classifyVM.getClassifyById = { useFor: usedFor, id: idNum };
        result = await this.sitemapService.getClassify(classifyVM);
        return result;
    }

    /**
     * 获取文章分类的上级分类
     * @param obj
     * @param {{id: number}} body
     * @returns {Promise<any>}
     */
    @Query("getParentClassify")
    async getParentClassify(obj, body: { id: number }) {
        classifyVM.getParentClassify = {id: body.id};
        const result = await this.sitemapService.getClassify(classifyVM);
        return result;
    }
    /**
     * 删除分类
     * @param obj
     * @param {{userFor: "art" | "page"; id: number}} body
     * @returns {Promise<string>}
     */
    @Mutation("deleteClassify")
    async deleteClassify(obj, body: { useFor: "art"|"page", id: number}) {
        classifyVM.deleteClassify = body.id;
        classifyVM.useFor = body.useFor;
        const result = await this.sitemapService.classifyCurd(classifyVM);
        return JSON.stringify(result);
    }

    /**
     * 移动分类
     * @param obj
     * @param {{useFor: "art" | "page"; id: number; parentId: number}} body
     * @returns {Promise<string>}
     */
    @Mutation("mobileClassify")
    async mobileClassify(obj, body: { useFor: "art"|"page", id: number, parentId: number}) {
        classifyVM.useFor = body.useFor;
        classifyVM.mobileClassifyId = { id: body.id, parentId: body.parentId };
        console.log("入参");
        console.log(classifyVM);
        const result = await this.sitemapService.classifyCurd(classifyVM);
        return JSON.stringify(result);
    }
    /**
     * 修改分类
     * @param obj
     * @param {{classify: ClassifyEntity; userFor: "art" | "page"}} arg
     * @returns {Promise<string>}
     */
    @Mutation("updateClassify")
    async updateClassify(obj, arg: {classify: ClassifyInterface , useFor: "art"|"page"}) {
        const createArt = arg.classify;
        if (createArt !== null && createArt !== undefined) {
            classifyVM.useFor = arg.useFor;
            if (classifyVM.useFor === "art") {
                classifyVM.updateClassify = { art: createArt};
            }
            if (classifyVM.useFor === "page") {
                classifyVM.updateClassify = { page: arg.classify};
            }
        }
        const result = await this.sitemapService.classifyCurd(classifyVM);
        return JSON.stringify(result);
    }

    /**
     * 新增分类
     * @param obj
     * @param {{classify: ClassifyEntity; userFor: "art" | "page"}} arg
     * @returns {Promise<string>}
     */
    @Mutation("createClassify")
    async createClassify(obj, arg: {classify: ClassifyInterface, useFor: "art"|"page"}){
        classifyVM.useFor = arg.useFor;
        if (classifyVM.useFor === "art") {
            classifyVM.createClassify = { art: arg.classify };
        }
        if(classifyVM.useFor === "page") {
            classifyVM.createClassify = { page: arg.classify };
        }
        const result = await this.sitemapService.classifyCurd(classifyVM);
        return JSON.stringify(result);
    }
}