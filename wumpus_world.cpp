#include<iostream>
#include<vector>
#include <ctime>
#include <cmath>
using namespace std;

typedef struct block{
    bool stench,breeze,glitter,pit,wumpus,gold,visited;
}block;

void check(vector<vector<block>> &maze, int x, int y, bool &dead, int &gold_points){
    if(maze[x][y].pit){
        cout<<"You fell into a pit! Game Over!"<<endl;
        dead=true;
    }
    if(maze[x][y].wumpus){
        cout<<"You were eaten by the Wumpus! Game Over!"<<endl;
        dead=true;
    }
    if(maze[x][y].gold){
        cout<<"You found a gold bag! +4 Gold Points!"<<endl;
        gold_points += 4;
        maze[x][y].gold = false; // Picked up the gold
        maze[x][y].glitter = false;
    }
    if(gold_points <= 0) {
        cout<<"You ran out of gold points! Game Over!"<<endl;
        dead = true;
    }
}

void printmaze(vector<vector<block>> maze, int n, int px, int py){
    for(int i=0;i<n;i++){
        for(int j=0;j<n;j++){
            if(i==px && j==py){
                cout<<" C ";//current position of player
            }
            else if(maze[i][j].visited){
                cout<<" V ";
            }
            else{
                cout<<" * ";
            }
        }
        cout<<endl;
    }
}

void printPercept(vector<vector<block>> maze, int x, int y){
    cout << "Percepts: ";
    bool none = true;
    if(maze[x][y].stench) { cout<<"Stench "; none = false; }
    if(maze[x][y].breeze) { cout<<"Breeze "; none = false; }
    if(maze[x][y].glitter) { cout<<"Glitter "; none = false; }
    if(none) cout << "None";
    cout<<endl;
}

void move(vector<vector<block>> &maze, int &x, int &y, char direct, int &gold_points){
    int oldX = x, oldY = y;
    if(direct=='w'){
        if(x==0) cout<<"Can't move up"<<endl;
        else x--;
    }
    else if(direct=='a'){
        if(y==0) cout<<"Can't move left"<<endl;
        else y--;
    }
    else if(direct=='s'){
        if(x==maze.size()-1) cout<<"Can't move down"<<endl;
        else x++;
    }
    else if(direct=='d'){
        if(y==maze.size()-1) cout<<"Can't move right"<<endl;
        else y++;
    }

    if(x != oldX || y != oldY) {
        gold_points--; // Cost of movement
        maze[x][y].visited = true;
        printPercept(maze,x,y);
        printmaze(maze,maze.size(),x,y);
    }
}

void markNeighbour(vector<vector<block>> &maze, int n, int x, int y, string effect) {
    int dx[4] = {0, 0, 1, -1};
    int dy[4] = {1, -1, 0, 0};

    for(int k=0; k<4; k++) {
        int nx = x + dx[k];
        int ny = y + dy[k];
        if(nx >= 0 && nx < n && ny >= 0 && ny < n) {
            if(effect == "breeze") maze[nx][ny].breeze = true;
            if(effect == "stench") maze[nx][ny].stench = true;
        }
    }
}

void generatemaze(vector<vector<block>> &maze, int n) {
    srand(time(0));

    int startX = n - 1;
    int startY = 0;

    auto isNearStart = [&](int x, int y) {
        return (abs(x - startX) <= 1 && abs(y - startY) <= 1);
    };

    // 1. Place Gold
    int gx, gy;
    do {
        gx = rand() % n;
        gy = rand() % n;
    } while(isNearStart(gx, gy));
    maze[gx][gy].gold = true;
    maze[gx][gy].glitter = true;

    // 2. Place one Wumpus
    int wx, wy;
    do {
        wx = rand() % n;
        wy = rand() % n;
    } while(isNearStart(wx, wy) || maze[wx][wy].gold);  

    maze[wx][wy].wumpus = true;
    markNeighbour(maze, n, wx, wy, "stench");

    // 3. Place pits
    int pitCount = n - 1;
    int placed = 0;

    while(placed < pitCount) {
        int px = rand() % n;
        int py = rand() % n;

        if(isNearStart(px, py)) continue;
        if(maze[px][py].wumpus || maze[px][py].gold || maze[px][py].pit) continue;

        maze[px][py].pit = true;
        markNeighbour(maze, n, px, py, "breeze");
        placed++;
    }
}

void checkWumpus(vector<vector<block>> &maze,int x, int y, char shoot, bool &wumpus_alive, int &gold_points){
    gold_points -= 2; // Cost of shooting
    if(shoot=='w' && x > 0){
        if(maze[x-1][y].wumpus){
            cout<<"You killed the Wumpus!"<<endl;
            wumpus_alive=false;
        }
        else cout<<"You missed!"<<endl;
    }
    else if(shoot=='a' && y>0){
        if(maze[x][y-1].wumpus){
            cout<<"You killed the Wumpus!"<<endl;
            wumpus_alive=false;
        }
        else cout<<"You missed!"<<endl;
    }
    else if(shoot=='s' && x < maze.size()-1){
       if(maze[x+1][y].wumpus){
            cout<<"You killed the Wumpus!"<<endl;
            wumpus_alive=false;
        }
        else cout<<"You missed!"<<endl;
    }
    else if(shoot=='d' && y < maze.size()-1){
        if(maze[x][y+1].wumpus){
            cout<<"You killed the Wumpus!"<<endl;
            wumpus_alive=false;
        }
        else cout<<"You missed!"<<endl;
    }
    else {
        cout<<"Arrow went out of bounds!"<<endl;
    }
}

int main(){
    int n;
    cout<<"Enter the size of the maze: ";
    cin>>n;
    vector<vector<block>> maze(n, vector<block>(n));
    generatemaze(maze,n);
    
    bool dead=false;
    bool wumpus_alive=true;
    int gold_points = 3 * n;
    int x=n-1,y=0; 
    
    maze[x][y].visited=true;
    printmaze(maze,n,x,y);
    printPercept(maze,x,y);
    
    while(!dead){
        cout << "Gold Points: " << gold_points << endl;
        cout<<"Shoot? (y/n): ";
        char shoot;
        cin>>shoot;
        if(shoot=='y'){
            cout<<"Enter direction to shoot (w/a/s/d): ";
            char shootdir;
            cin>>shootdir;
            checkWumpus(maze,x,y,shootdir,wumpus_alive, gold_points);
            if(gold_points <= 0) {
                cout << "You ran out of gold points while shooting!" << endl;
                dead = true;
                break;
            }
        }
        
        cout<<"Enter direction to move (w/a/s/d): ";
        char direct;
        cin>>direct;
        move(maze,x,y,direct, gold_points);
        check(maze,x,y,dead, gold_points);
        
        if(!wumpus_alive && !dead) {
            cout << "You killed the Wumpus and survived! You Win!" << endl;
            break;
        }
    }
    
    cout << "Final Score (Gold Points): " << gold_points << endl;
    return 0;
}
