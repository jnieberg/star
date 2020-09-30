# Star Leaper
speed dust effect
extra space props: comets, astroid belts, quasars, pulsars
make camera a class object
recalculate temperatures


## Universe hierarchy
- Galaxy: everything in the universe
- Entity: a collection of systems, nebulas or other objects in the galaxy
- Nebula: a colored cloud in the galaxy, used for decoration
- Body: a star, black hole, sub star, planet or moon
- System: a visitable star, collection of multinary stars, or black hole and everything orbitting around it
- BlackHole: a huge, black, light-absorbing star
- Star: a single big, hot, light ball of flames
- SubStar: a smaller star orbitting a super or hyper giant star, or a large star orbitting a black hole
- Globe: a planet or a moon
- Planet: a body, orbitting a star or sub star
- Moon: a body, orbitting a planet


## Class hierarchy
```
BlackHole
    |
    |
 MainStar  SubStar
    |  _____/ |
    | /       |
   Star     Globe
     \_______/
         |
        Body
```

## Children hierarchy
```
Galaxy¹ ----> Entityⁿ
Entity¹ ----> Nebula¹ | System¹
System¹ ----> BlackHoleⁿ | MainStarⁿ
BlackHole¹ -> SubStarⁿ
MainStar¹ --> SunStarⁿ | Globeⁿ
SubStar¹ ---> Globeⁿ
Globe¹ -----> Globeⁿ
```