import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PageEntity } from "./page.entity";

@Entity("page_content_table")
export class PageContentEntity {
    /*内容Id*/
    @PrimaryGeneratedColumn()
    id: number;

    /*页面Id*/
    @Column({ nullable: true })
    parentId: number;

    /*页面内容*/
    @Column({
        nullable: true,
        length: 10000,
    })
    content: string;

    @ManyToOne(
        type => PageEntity,
        page => page.contents,
        {
            cascade: false,
            onDelete: "CASCADE",
            nullable: true,
            lazy: false,
            eager: false
        },
    )
    @JoinColumn({ name: "parentId", referencedColumnName: "id" })
    page: PageEntity;

    /*创建时间*/
    @CreateDateColumn()
    createAt: Date;

    /*修改时间*/
    @UpdateDateColumn()
    updateAt: Date;
}
