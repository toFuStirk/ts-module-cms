import { ClassifyInterface } from "../../common/classify.interface";

export class ClassifyCurdVm {
    /*适用于*/
    public useFor: string;
    /*id*/
    public id: number;

    /*创建分类*/
    public createClassify?: { art?: ClassifyInterface, page?: ClassifyInterface };

    /*修改分类*/
    public updateClassify?: { art?: ClassifyInterface, page?: ClassifyInterface };

    /*删除分类*/
    public deleteClassify?: number;

    /*移动分类*/
    public mobileClassifyId?: { id: number, parentId: number };

    /*获取分类*/
    public getAllClassify?: boolean;

    /*获取具体分类*/
    public getClassifyById?: { id: number, useFor: string };
    /*获取上级分类直到根目录*/
    public getParentClassify?: {id: number};
}
