CREATE TABLE `withdraws` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `steamid` varchar(25) NOT NULL,
  `tradeid` varchar(20) NOT NULL,
  `value` int(11) NOT NULL,
  `state` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8