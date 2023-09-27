## Project setup
```
make setup
```

## Launch `Game-engine`
```
make start-game-engine
```

## Launch `Wallet`
```
make start-wallet
```

## Launch `Game-engine` and `Wallet` in one proccess
```
make start-both
```

## Available wallets:
     659de711-22f2-451a-a81f-e86e0c428812
     a8533c47-3463-47ce-9221-edcc907822e9
     c51524f3-cd57-46d1-b266-16f816da055b
     f4a7b1b6-22e4-401b-ba8d-05bdf211bda1
     ef184bb4-77c4-4bdc-8c75-9f4288b4d954

## Request example:
    POST http://localhost:3000/api/make-bet
    
```
{
  "walletId": "c51524f3-cd57-46d1-b266-16f816da055b",
  "amount": 100,
  "gameId": 4
}
```