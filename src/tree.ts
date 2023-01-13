import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import * as rd from 'readline';



// we need to inherit from vscode.TreeItem
export class TreeItem extends vscode.TreeItem 
{

    // children represent branches, which are also items 
    public children: TreeItem[] = [];

    // add all members here, file and line we'll need later
    // the label represent the text which is displayed in the tree
    // and is passed to the base class
    constructor(label: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    // a public method to add childs, and with additional branches
    // we want to make the item collabsible
    public add_child (child : TreeItem) {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.children.push(child);
    }
}



// 1. we'll export this class and use it in our extension later
// 2. we need to implement vscode.TreeDataProvider
export class TreeView implements vscode.TreeDataProvider<TreeItem>
{
    // m_data holds all tree items 
    private m_data : TreeItem [] = [];
    // // with the vscode.EventEmitter we can refresh our  tree view
    // private m_onDidChangeTreeData: vscode.EventEmitter<tree_item | undefined> = new vscode.EventEmitter<tree_item | undefined>();
    // // and vscode will access the event by using a readonly onDidChangeTreeData (this member has to be named like here, otherwise vscode doesnt update our treeview.
    // readonly onDidChangeTreeData ? : vscode.Event<tree_item | undefined> = this.m_onDidChangeTreeData.event;
    
    // we register two commands for vscode, item clicked (we'll implement later) and the refresh button. 
    public constructor(onItemClicked : (args: TreeItem) => any)  {
        
        vscode.commands.registerCommand('vkmask.item_clicked', onItemClicked);
        // vscode.commands.registerCommand('cwt_cucumber.refresh', () => this.refresh());
    }

    // we need to implement getTreeItem to receive items from our tree view
    public getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
        const item = new vscode.TreeItem(element.label!, element.collapsibleState);
        let title = item.label ? item.label.toString() : "";
        item.id = element.id;
        item.command = { command: 'vkmask.item_clicked', title : title, arguments: [item] };

        return item;
    }

    // and getChildren
    public getChildren(element : TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.m_data;
        } else {
            return element.children;
        }
    }

    // // this is called when we click an item
    // public item_clicked(item: tree_item) {
    //     // we implement this later
    //     console.log(item.label);
    // }

    // this is called whenever we refresh the tree view
    public refresh() {
        // if (vscode.workspace.workspaceFolders) {
        //     this.m_data = [];
        //     this.read_directory(vscode.workspace.workspaceFolders[0].uri.fsPath);
        //     this.m_onDidChangeTreeData.fire(undefined);
        // } 
        this.m_data = [];

    }

    public addItem(item : TreeItem) {
        this.m_data.push(item)
    }


    // // read the directory recursively over all files
    // private read_directory(dir: string) {
    //     fs.readdirSync(dir).forEach(file => {
    //         let current = path.join(dir,file);
    //         console.log("current " + current);
    //         if (fs.statSync(current).isFile()) {
    //             if(current.endsWith('.feature')) {
    //                 this.parse_feature_file(current);
    //             } 
    //         } else {
    //             this.read_directory(current)
    //         }
    //     });
    // }

    // // and if we find a *.feature file parse the content
    // private parse_feature_file(file: string) {
    //     const regex_feature = new RegExp("(?<=Feature:).*");
    //     const regex_scenario = new RegExp("(?<=Scenario:).*");
    //     let reader = rd.createInterface(fs.createReadStream(file))
    //     const line_counter = ((i = 0) => () => ++i)();

    //     // let's loop over every line
    //     reader.on("line", (line : string, line_number : number = line_counter()) => {
    //         let is_feature = line.match(regex_feature);
    //         if (is_feature) {
    //             // we found a feature and add this to our tree view data
    //             this.m_data.push(new tree_item(is_feature[0], file, line_number));
    //         }
    //         let is_scenario = line.match(regex_scenario);
    //         if (is_scenario) {
    //             // every following scenario will be added to the last added feature with add_children from the tree_item
    //             this.m_data.at(-1)?.add_child(new tree_item(is_scenario[0], file, line_number));
    //         }
    //     });
    // }

}