package com.lomia.utils;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.session.SqlSession;
import java.io.IOError;
import java.io.IOException;
import java.io.InputStream;

//sqlSession --> SqlSessionFactory --> DataSource
public class MybatisUtils {
    private static SqlSessionFactory sqlSessionFactory;
    static {
        try{
            String resource = "mybatis-config.xml";
            InputStream inputStream = Resources.getResourceAsStream(resource);
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        }catch (IOException e){
            e.printStackTrace();
        }
    }

    //获取 SqlSession 对象：SqlSessionFactory 每次调用 openSession() 都会新建一个会话
    //使用完后需要及时关闭，避免资源泄漏
    public static SqlSession getSqlSession(){
        return sqlSessionFactory.openSession();
    }
}
