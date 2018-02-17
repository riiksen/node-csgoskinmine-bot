CREATE TABLE `withdraws` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `steamid` varchar(25) NOT NULL,
  `tradeid` varchar(20) NOT NULL,
  `value` int(11) NOT NULL,
  `state` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

CREATE TABLE `deposits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `steamid` varchar(25) NOT NULL,
  `tradeid` varchar(25) NOT NULL,
  `value` int(11) NOT NULL,
  `state` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `steamid` varchar(17) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` text NOT NULL,
  `coins` int(11) NOT NULL DEFAULT '0',
  `refferal_count` int(11) NOT NULL DEFAULT '0',
  `refferal_available` int(11) DEFAULT '0',
  `refferal_total` int(11) DEFAULT '0',
  `refferal_used` varchar(17) DEFAULT NULL,
  `csgo` tinyint(1) NOT NULL DEFAULT '0',
  `steam_group` tinyint(1) NOT NULL DEFAULT '0',
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  `lastshare` int(11) DEFAULT NULL,
  `daily_bonus` datetime DEFAULT NULL
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8