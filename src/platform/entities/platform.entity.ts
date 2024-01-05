import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Platform {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    dockerImage: string;

    @Column()
    fileExt: string;

    @Column({ nullable: true })
    buildCommand: string;

    @Column({ nullable: true })
    fileBuiltExt: string;

    @Column()
    execCommand: string;
}
