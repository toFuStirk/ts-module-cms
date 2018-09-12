import { Column, JoinColumn, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ClassifyEntity } from "./classify.entity";

@Entity("article_entity_table")
export class ArticleEntity {
    /*文章Id*/
    @PrimaryGeneratedColumn()
    id: number;

    /*文章名*/
    @Column({
        nullable: true,
        length: 120,
    })
    name: string;

    /*分类Id*/
    @Column({
        nullable: true,
    })
    classifyId: number;

    /*文章地址*/
    @Column({
        nullable: true,
        length: 200,
    })
    url: string;

    /*来源*/
    @Column({
        nullable: true,
        length: 120,
    })
    source: string;

    /*来源链接*/
    @Column({
        nullable: true,
        length: 200,
    })
    sourceUrl: string;

    /*置顶*/
    @Column()
    topPlace: string;

    /*是否隐藏*/
    @Column({
        nullable: false,
    })
    hidden: boolean;

    /*删除(回收站)*/
    @Column({
        nullable: true,
        default: false
    })
    recycling: boolean;

    /*发布时间*/
    @Column({
        nullable: true,
        default: () => "NOW ()"
    })
    publishedTime: Date;

    /*摘要*/
    @Column({
        nullable: true,
        length: 500,
    })
    abstract: string;

    /*内容*/
    @Column({
        nullable: true,
        length: 65532,
    })
    content: string;

    /*不显示分类*/
    @Column({
        nullable: true,
    })
    display: string;

    /*开始时间*/
    @Column({
        nullable: true,
    })
    startTime: Date;

    /*結束时间*/
    @Column({
        nullable: true,
    })
    endTime: Date;

    /*活动时间*/
    @Column({
        nullable: true,
        length: 300,
    })
    activityAddress: string;

    /*主办单位*/
    @Column({
        nullable: true,
        length: 200,
    })
    organizer: string;

    /*活动人数*/
    @Column({
        nullable: true,
    })
    peopleNum: number;

    /*创建时间*/
    @CreateDateColumn()
    createAt: Date;

    /*修改时间*/
    @UpdateDateColumn()
    updateAt: Date;

    /*图片地址*/
    @Column({
        nullable: true,
        length: 500,
    })
    pictureUrl: string;

    /*无用*/
    @Column({
        default: false,
    })
    check: boolean;

    @ManyToOne(
        type => ClassifyEntity, classifyEntity => classifyEntity.articles
    )
    @JoinColumn({
        name: "classifyId",
        referencedColumnName: "id"
    })
    classify: ClassifyEntity;
    // 上传图片
    pictureUpload: PictureFace;
}
export class PictureFace {
    /*空间名*/
    bucketName: string;
    /*图片名*/
    rawName: string;
    /*图片base64编码*/
    base64: string;
}
