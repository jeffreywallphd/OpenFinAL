import {LearningModule} from "../../../Entity/LearningModule";
import {LearningPage} from "../../../Entity/LearningPage";
import {IEntity} from "../../../Entity/IEntity";
import {IKeylessDataGateway} from "../IKeylessDataGateway";

export class LearningModuleSQLiteDBGateway implements IKeylessDataGateway {
    sourceName: string = "SQLite Database";

    connect(): void {
        throw new Error("Method not implemented.");
    }

    disconnect(): void {
        throw new Error("Method not implemented.");
    }

    create(entity: IEntity, action: string): Promise<Boolean> {
        //at the moment, users will not be permitted to create new modules
        //however, should cloud storage be used in the future, 
        //a learning module marketplace could be created, with module creation capability
        throw new Error("Method not implemented.");
    }

    async read(entity: IEntity, action: string): Promise<IEntity[]> {      
        //TODO: implement module extraction
        throw new Error("Method not implemented.");
    }

    update(entity: IEntity, action: string): Promise<number> {
        //at the moment, users will not be permitted to create new modules
        //however, should cloud storage be used in the future, 
        //a learning module marketplace could be created, with module update capability
        throw new Error("Method not implemented.");
    }

    delete(entity: IEntity, action: string): Promise<number> {
        //at the moment, users will not be permitted to create new modules
        //however, should cloud storage be used in the future, 
        //a learning module marketplace could be created, with module deletion capability
        throw new Error("Method not implemented.");
    }
}