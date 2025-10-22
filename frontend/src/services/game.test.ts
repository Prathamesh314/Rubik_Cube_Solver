// import { Game } from './game';
// import { Player, CubeCategories } from '@/modals/player';
// import { Redis } from '@/utils/redis';
// import { Room } from '@/modals/room';

// // Mock the Redis module
// jest.mock('@/utils/redis');

// describe('Game', () => {
//     let mockRedis: jest.Mocked<Redis>;
//     let mockPlayer: Player;
//     let game: Game;

//     beforeEach(() => {
//         // Reset all mocks before each test
//         jest.clearAllMocks();

//         // Create a mock Redis instance
//         mockRedis = {
//             connect: jest.fn().mockResolvedValue(undefined),
//             tryMatchOrEnqueue: jest.fn(),
//         } as any;

//         // Mock Redis.getInstance to return our mock
//         (Redis.getInstance as jest.Mock).mockReturnValue(mockRedis);

//         // Create a mock player
//         mockPlayer = {
//             player_id: 'player-123',
//             username: 'Test Player',
//             player_state: undefined as any, // or some valid PlayerState, e.g., PlayerState.Waiting
//             rating: 1000,
//             total_wins: 0,
//             win_percentage: 0,
//             top_speed_to_solve_cube: {},
//         };

//         // Create a new Game instance for each test
//         game = new Game();
//     });

//     describe('constructor', () => {
//         it('should create a Game instance with correct properties', () => {
//             expect(game).toBeInstanceOf(Game);
//             expect(Redis.getInstance).toHaveBeenCalled();
//         });
//     });

//     describe('start_game', () => {
//         it('should return queued status when no opponent is found', async () => {
//             const mockRoom: Room = {
//                 id: 'room-abc',
//                 players: ['player-123'],
//                 maxPlayers: 2,
//                 gameState: { status: "init", variant: CubeCategories.ThreeCube },
//                 variant: CubeCategories.ThreeCube,
//                 createdAt: 123456789
//             };
//             const queuedResponse = {
//                 queued: true,
//                 room: mockRoom,
//             };
//             mockRedis.tryMatchOrEnqueue.mockResolvedValue(queuedResponse);

//             const result = await Game.start_game(
//                 mockPlayer,
//                 mockRoom.id,
//                 CubeCategories.ThreeCube
//             );

//             expect(result).toEqual({
//                 queued: true,
//                 room: mockRoom,
//             });
//             expect(mockRedis.tryMatchOrEnqueue).toHaveBeenCalledWith(
//                 mockPlayer,
//                 mockRoom.id,
//                 CubeCategories.ThreeCube
//             );
//         });
//     });

//         // it('should return matched status with room when opponent is found', async () => {
//         //     const mockRoom: Room = {
//         //         id: 'room-456',
//         //         players: ['player-123', 'player-789'],
//         //         maxPlayers: 2,
//         //         gameState: {},
//         //         variant: CubeCategories.ThreeCube,
//         //         createdAt: Date.now(),
//         //     };

//         //     const matchedResponse = {
//         //         queued: false,
//         //         room: mockRoom,
//         //     };
//         //     mockRedis.tryMatchOrEnqueue.mockResolvedValue(matchedResponse);

//         //     const result = await game.start_game();

//         //     expect(result).toEqual({
//         //         status: 'matched',
//         //         room: mockRoom,
//         //     });
//         //     expect(game.room).toBe(mockRoom);
//         // });

//         // it('should handle errors from Redis', async () => {
//         //     mockRedis.tryMatchOrEnqueue.mockRejectedValue(
//         //         new Error('Redis error')
//         //     );

//         //     await expect(game.start_game()).rejects.toThrow('Redis error');
//         // });

//         // it('should call tryMatchOrEnqueue with correct variant', async () => {
//         //     const gameWithDifferentVariant = new Game(
//         //         mockPlayer,
//         //         CubeCategories.FourCube
//         //     );
            
//         //     mockRedis.tryMatchOrEnqueue.mockResolvedValue({
//         //         queued: true,
//         //         player_id: 'player-123',
//         //     });

//         //     await gameWithDifferentVariant.start_game();

//         //     expect(mockRedis.tryMatchOrEnqueue).toHaveBeenCalledWith(
//         //         mockPlayer,
//         //         CubeCategories.FourCube
//         //     );
// });